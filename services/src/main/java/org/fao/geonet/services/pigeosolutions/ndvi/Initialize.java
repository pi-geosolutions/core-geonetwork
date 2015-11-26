package org.fao.geonet.services.pigeosolutions.ndvi;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.fao.geonet.ApplicationContextHolder;
import org.fao.geonet.kernel.GeonetworkDataDirectory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.io.FilenameFilter;
import java.util.Arrays;

//=============================================================================

/** Gets the list of datasets and the bounds that define them (min and max date, etc)
 */

@Controller("pigeo.ndvi.initialize")
public class Initialize
{
    private String _fullpath;
    private final String BASE_PATH = "/home/large/geoserver-prod-datadir/data/afo/rast/5_ndvi";
    private final String EXT = "tif";


    @RequestMapping(value="/{lang}/pigeo.ndvi.initialize")
    @ResponseBody
    public JSONObject exec()  {

        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        GeonetworkDataDirectory dataDirectory = appContext.getBean(GeonetworkDataDirectory.class);

        if (BASE_PATH.startsWith("/")) { //then it is an absolute URL
            _fullpath = BASE_PATH;
        } else { //we suppose it's a subdirectory of geonetwork-data-dir
            _fullpath = dataDirectory.getSystemDataDir()+File.separator+BASE_PATH;
        }

        return collectInfo(_fullpath, EXT);
    }

    public JSONObject collectInfo(String path, String ext) {
        if (path == null) {
            String error = "Error recovering the file path : "+path+"($path)";
            System.out.println(error);
            JSONObject res = new JSONObject();
            res.put("success", false);
            res.put("error", error);
            return res;
        }
        JSONObject res = new JSONObject();
        res.put("path", path);
        res.put("EXT", EXT);

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
                JSONArray dss = new JSONArray();
                res.put("datasets", dss);
                for (int i = 0; i < datasets.length; i++)
                {
                    String dataset = datasets[i];
                    JSONObject ds = new JSONObject();
                    ds.put("name",dataset);

                    //And we get the time-span (available years) for each data
                    ds.put("years", getTimeSpan(dataset));
                    dss.add(ds);
                }
            }
        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }
        return res;
    }

    public JSONArray getTimeSpan(String datasetname) {
        JSONArray years = new JSONArray();
        String path = _fullpath + File.separator + datasetname;
        String ext = EXT;
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
                                years.add(Integer.toString(newyear));
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

        return years;
    }
}

//=============================================================================


