package fr.pigeosolutions.geoportal.services.ndvi;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import jeeves.utils.Util;

import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.jdom.Element;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.Arrays;

//=============================================================================

/** Gets the list of datasets and the bounds that define them (min and max date, etc)
 */

public class Initialize implements Service
{
    private String _basepath;
    private String _fullpath;
    private String _ext;

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

        _fullpath = geonetworkDataDir+File.separator+_basepath;

        return collectInfo(_fullpath, _ext);

    }

    public Element collectInfo(String path, String ext) {
        if (path == null)
        {
            System.out.println("Error recovering the file path : "+path+"($path)");
            return new Element(Jeeves.Elem.RESPONSE);
        }
        //else...
        Element responseXML = new Element(Jeeves.Elem.RESPONSE);
        responseXML.addContent(new Element("path").setText(path));
        responseXML.addContent(new Element("ext").setText(ext));

        String files;
        try {
            //First, we list and collect the rootFolder names : each rootFolder in this path is supposed to be relevant
            File rootFolder = new File(path);
            if (rootFolder.canRead()) {
                String[] datasets = rootFolder.list(new FilenameFilter() {
                    @Override
                    public boolean accept(File current, String name) {
                        return new File(current, name).isDirectory();
                    }
                });
                Arrays.sort(datasets);
                Element datasetsXML = new Element("datasets");
                for (int i = 0; i < datasets.length; i++) 
                {
                    String dataset = datasets[i];
                    Element datasetXML = new Element("dataset");
                    datasetXML.addContent(new Element("name").setText(dataset));

                    //And we get the time-span (available years) for each data
                    Element timespanXML = getTimeSpan(dataset);                        
                    datasetXML.addContent(timespanXML);
                    datasetsXML.addContent(datasetXML);
                }
                responseXML.addContent(datasetsXML);
            }
        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }


        return responseXML;
    }

    public Element getTimeSpan(String datasetname) {
        Element timespanXML = new Element("years");
        String path = _fullpath + File.separator + datasetname;
        String ext = _ext;
        int year = 1950;
        String filename;
        try {
            File folder = new File(path);
            if (folder.canRead()) {
                File[] listOfFiles = folder.listFiles(); 
                Arrays.sort(listOfFiles);
                for (int i = 0; i < listOfFiles.length; i++) 
                {
                    if (listOfFiles[i].isFile() && listOfFiles[i].getName().endsWith(ext)) 
                    {
                        filename = listOfFiles[i].getName();
                        try {
                            int newyear = Integer.parseInt(filename.substring(0, 4)); //get 4 first digits (=year)
                            if (newyear != year) {
                                timespanXML.addContent(new Element("year").setText(Integer.toString(newyear)));
                                year = newyear;
                            }
                        } catch (NumberFormatException e){
                            String msg = "unrelevant file name in folder "+path + "(file name is "+
                                    filename+" but should begin with the corresponding year, eg. 1998)";
                            System.err.println(msg);
                        }
                    }
                }
            }

        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }

        return timespanXML;
    }
}

//=============================================================================


