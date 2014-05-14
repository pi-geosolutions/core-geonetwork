package fr.pigeosolutions.geoportal.services.ndvi;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import jeeves.utils.Util;

import org.apache.commons.io.filefilter.PrefixFileFilter;
import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.io.AbstractGridCoverage2DReader;
import org.geotools.coverage.grid.io.AbstractGridFormat;
import org.geotools.coverage.grid.io.GridFormatFinder;
import org.geotools.geometry.DirectPosition2D;
import org.geotools.referencing.CRS;
import org.opengis.geometry.DirectPosition;

import org.jdom.Element;
import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.Arrays;

//=============================================================================

/** Returns the list of NDVI-like files, in the specified folder, ordered alphabetically
 */

public class GetValues implements Service
{
    //vars defined as service parameters in config-pigeo.xml
    private String _basepath;
    private String _ext;
    //vars defined as GET params while calling the service
    private String qDataName, qSuffix, qMode, qLat, qLon;
    //other global vars
    private String fullpath;
    private enum Mode { //necessary for the switch statement since String can be used in switch statements only since 1.7
       decade, year, yearByMonths;
   }
    private AbstractGridCoverage2DReader reader;


    public void init(String appPath, ServiceConfig config) throws Exception {
        _basepath = config.getValue("basePath");
        _ext = config.getValue("ext");
    }

    //--------------------------------------------------------------------------
    //---
    //--- Service
    //---
    //--------------------------------------------------------------------------

    public Element exec(Element params, ServiceContext context) throws Exception
    {
       GeonetContext gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);
        String geonetworkDataDir = gc.getHandlerConfig().getMandatoryValue( Geonet.Config.SYSTEM_DATA_DIR);

        qDataName = Util.getParam(params, "data","NDVI");
        qSuffix = Util.getParam(params, "suffix","DV");
        qMode = Util.getParam(params, "mode");
        qLat = Util.getParam(params, "lat");
        qLon = Util.getParam(params, "lon");
        if (qMode == null || qDataName==null || qLat==null || qLon ==null)
        {
            System.out.println("Bad or missing parameters. See the doc");
            return new Element(Jeeves.Elem.RESPONSE);
        }
        if (_basepath.startsWith("/")) { //then it is an absolute URL
            fullpath = _basepath+File.separator+qDataName;
        } else { //we suppose it's a subdirectory of geonetwork-data-dir
            fullpath = geonetworkDataDir+File.separator+_basepath+File.separator+qDataName;
        }
       
        Element output;
        Mode mode = Mode.valueOf(qMode); //necessary since String can be used in switch statements only since 1.7
        switch (mode) {
        case decade:
            output= collectByDecade(fullpath, qLat, qLon, params);
            break;
        case year:
            output= collectByYear(fullpath, qLat, qLon, params);
            break;
        case yearByMonths:
            output= collectByYM(fullpath, qLat, qLon, params);
            break;
        default:
            output= new Element(Jeeves.Elem.RESPONSE);
            break;
        }
        return output;
    }
    //--------------------------------------------------------------------------
    
    private Element collectByYM(String path, String lat, String lon, Element params) {
        final String year = Util.getParam(params, "year");
        if (year == null)
        {
            System.out.println("Bad or missing parameters. See the doc");
            return new Element(Jeeves.Elem.RESPONSE);
        }
        //else...
        Element outputXML = new Element(Jeeves.Elem.RESPONSE);
        outputXML.addContent(new Element("path").setText(path));
        outputXML.addContent(new Element("_ext").setText(_ext));
        outputXML.addContent(params);
        Element datasetXML = new Element("dataset");
        outputXML.addContent(datasetXML);

        try {
            File folder = new File(path);
            if (folder.canRead()) {
                for (int i = 1; i <= 12; i++) { //iterate through the months
                    Element rowXML = new Element("row");
                    rowXML.addContent(new Element("month").setText(String.format("%02d", i)));
                    for (int j = 0; j <= 2; j++) {//iterate through the decades
                        //Create a filter
                        String filter = year + String.format("%02d", i) +String.format("%02d", j*10+1);
                        System.out.println("filter "+filter);
                        File[] listOfFiles = folder.listFiles((FilenameFilter) new PrefixFileFilter(filter));
                        switch (listOfFiles.length) {
                        case 1 : 
                            if (listOfFiles[0].canRead()) 
                            {
                                double[] val = this.getValue(listOfFiles[0], Double.parseDouble(lat), Double.parseDouble(lon));
                                rowXML.addContent(new Element("decade"+(j+1)).setText(String.valueOf((int)val[0])));
                            }
                            break;
                        case 0 : //no file found, we return value 0
                            rowXML.addContent(new Element("value").setText("0"));

                            break;
                        default: //means we have more than 1
                            System.err.println("multiple files when only one should fit to the filter " + filter);
                            for (int k = 0 ; k< listOfFiles.length ; k++) {
                                System.err.println(listOfFiles[k].getName());
                            }
                            System.err.println("Taking the first one...");
                            if (listOfFiles[0].canRead()) 
                            {
                                double[] val = this.getValue(listOfFiles[0], Double.parseDouble(lat), Double.parseDouble(lon));
                                rowXML.addContent(new Element("decade"+(j+1)).setText(String.valueOf((int)val[0])));
                            }
                            break;
                        }
                    } //end of decade loop
                    datasetXML.addContent(rowXML);
                } //end of month loop
            }
            
        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }
        return outputXML;
    }

    public Element collectByDecade(String path, String lat, String lon, Element params) {
        final String date = Util.getParam(params, "date");
        if (date == null)
        {
            System.out.println("Bad or missing parameters. See the doc");
            return new Element(Jeeves.Elem.RESPONSE);
        }
        //else...
        Element outputXML = new Element(Jeeves.Elem.RESPONSE);
        outputXML.addContent(new Element("path").setText(path));
        outputXML.addContent(new Element("_ext").setText(_ext));
        outputXML.addContent(params);
        Element datasetXML = new Element("dataset");
        outputXML.addContent(datasetXML);

        try {
            File folder = new File(path);
            if (folder.canRead()) {
                //We apply a filter to get only the relevant files
                File[] listOfFiles = folder.listFiles(new FilenameFilter() {
                    @Override
                    public boolean accept(File current, String name) {
                        String filter = "[1-2][0-9]{3}"+date+".*\\."+_ext;
                        return name.matches(filter);
                    }
                }); 
                Arrays.sort(listOfFiles);
                for (int i = 0; i < listOfFiles.length; i++) 
                {
                    if (listOfFiles[i].canRead()) 
                    {
                        double[] val = this.getValue(listOfFiles[i], Double.parseDouble(lat), Double.parseDouble(lon));
                        String name = listOfFiles[i].getName();
                        Element rowXML = new Element("row");
                        rowXML.addContent(new Element("year").setText(name.substring(0, 4)));
                        rowXML.addContent(new Element("value").setText(String.valueOf((int)val[0])));
                        datasetXML.addContent(rowXML);
                    }
                }
            }
            
        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }
        return outputXML;
    }

    
    private Element collectByYear(String path, String lat, String lon, Element params) {
        // TODO Auto-generated method stub
        return new Element(Jeeves.Elem.RESPONSE);
    }
    
    private double[] getValue(File rasterFile, double lat, double lon) throws Exception {
        AbstractGridFormat format = GridFormatFinder.findFormat( rasterFile );        
        reader = format.getReader(rasterFile);
        GridCoverage2D cov = null;
        try {
            cov = reader.read(null);
        } catch (IOException giveUp) {
            throw new RuntimeException(giveUp);
        }
        DirectPosition pos = new DirectPosition2D(CRS.decode("EPSG:4326", true),lon, lat);
        double[] val = cov.evaluate(pos, (double[]) null);
        return val;
    }


}


