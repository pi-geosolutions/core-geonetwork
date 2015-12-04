package org.fao.geonet.services.pigeosolutions.ndvi;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.io.filefilter.PrefixFileFilter;
import org.fao.geonet.ApplicationContextHolder;
import org.fao.geonet.kernel.GeonetworkDataDirectory;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.io.AbstractGridCoverage2DReader;
import org.geotools.coverage.grid.io.AbstractGridFormat;
import org.geotools.coverage.grid.io.GridFormatFinder;
import org.geotools.geometry.DirectPosition2D;
import org.geotools.referencing.CRS;
import org.opengis.geometry.DirectPosition;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.Arrays;

//=============================================================================
//http://localhost:8080/geonetwork/srv/fre/pigeo.ndvi.getvalues?data=ndvi&mode=yearByMonths&lat=13.921286845169426&lon=-15.635446747281302
/** Returns the list of NDVI-like files, in the specified folder, ordered alphabetically
 */

@Controller("pigeo.ndvi.getvalues")
public class GetValues
{
    //vars defined as service parameters in config-pigeo.xml
    private String fullpath;

    private final String BASE_PATH = "/home/large/geoserver-prod-datadir/data/afo/rast/5_ndvi";
    private final String EXT = "tif";

    private enum Mode { //necessary for the switch statement since String can be used in switch statements only since 1.7
        decade, year, yearByMonths;
    }
    private AbstractGridCoverage2DReader reader;
    
    @RequestMapping(value="/{lang}/pigeo.ndvi.getvalues", produces= MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public JSONObject exec(@PathVariable String lang,
                           @RequestParam String data,
                           @RequestParam String mode,
                           @RequestParam String lat,
                           @RequestParam(required = false) String year,
                           @RequestParam(required = false) String date,
                           @RequestParam String lon)  {

        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        GeonetworkDataDirectory dataDirectory = appContext.getBean(GeonetworkDataDirectory.class);

        fullpath = dataDirectory.getSystemDataDir()+File.separator+BASE_PATH+File.separator+data;
        if (BASE_PATH.startsWith("/")) { //then it is an absolute file path
            fullpath = BASE_PATH+File.separator+data;
            System.out.println("Using absolute file path to get the NDVI & like dataset: "+fullpath);
        }
        JSONObject output;
        Mode modeE = Mode.valueOf(mode); //necessary since String can be used in switch statements only since 1.7
        switch (modeE) {
            case decade:
                output = collectByDecade(fullpath, lat, lon, date);
                break;
            case year:
                output = collectByYear(fullpath, lat, lon);
                break;
            case yearByMonths:
                output = collectByYM(fullpath, lat, lon, year);
                break;
            default:
                output = new JSONObject();
                output.put("success", true);
                break;
        }
        output.put("success", true);

        return output;
    }

    //--------------------------------------------------------------------------

    private JSONObject collectByYM(String path, String lat, String lon, String year) {

        JSONObject params = new JSONObject();
        params.put("lat", lat);
        params.put("lon", lon);
        params.put("year", year);

        JSONObject res = new JSONObject();
        res.put("path", path);
        res.put("EXT", EXT);
        res.put("params", params);

        JSONArray dataset = new JSONArray();
        res.put("dataset", dataset);

        try {
            File folder = new File(path);
            if (folder.canRead()) {
                for (int i = 1; i <= 12; i++) { //iterate through the months
                    JSONObject row = new JSONObject();
                    row.put("month", String.format("%02d", i));
                    for (int j = 0; j <= 2; j++) {//iterate through the decades
                        //Create a filter
                        String filter = year + String.format("%02d", i) +String.format("%02d", j*10+1);
                        //System.out.println("filter "+filter);
                        File[] listOfFiles = folder.listFiles((FilenameFilter) new PrefixFileFilter(filter));
                        switch (listOfFiles.length) {
                            case 1 :
                                if (listOfFiles[0].canRead())
                                {
                                    double[] val = this.getValue(listOfFiles[0], Double.parseDouble(lat), Double.parseDouble(lon));
                                    row.put("decade"+(j+1), String.valueOf((int)val[0]));
                                }
                                break;
                            case 0 : //no file found, we return value 0
                                row.put("value", "0");

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
                                    row.put("decade"+(j+1), String.valueOf((int)val[0]));
                                }
                                break;
                        }
                    } //end of decade loop
                    dataset.add(row);
                } //end of month loop
            }

        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }
        return res;
    }

    public JSONObject collectByDecade(String path, String lat, String lon, final String date) {
        if (date == null) {
            System.out.println("Bad or missing parameters. See the doc");
            JSONObject res = new JSONObject();
            res.put("success", false);
            res.put("error", "Missing date parameter");
            return res;
        }

        JSONObject params = new JSONObject();
        params.put("lat", lat);
        params.put("lon", lon);
        params.put("date", date);

        JSONObject res = new JSONObject();
        res.put("path", path);
        res.put("EXT", EXT);
        res.put("params", params);

        JSONArray dataset = new JSONArray();
        res.put("dataset", dataset);

        try {
            File folder = new File(path);
            if (folder.canRead()) {
                //We apply a filter to get only the relevant files
                File[] listOfFiles = folder.listFiles(new FilenameFilter() {
                    @Override
                    public boolean accept(File current, String name) {
                        String filter = "[1-2][0-9]{3}"+date+".*\\."+EXT;
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
                        JSONObject row = new JSONObject();
                        row.put("year",name.substring(0, 4));
                        row.put("value",String.valueOf((int)val[0]));
                        dataset.add(row);
                    }
                }
            }
        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }
        return res;
    }


    private JSONObject collectByYear(String path, String lat, String lon) {
        // TODO Auto-generated method stub
        JSONObject res = new JSONObject();
        res.put("success", true);
        return res;
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

