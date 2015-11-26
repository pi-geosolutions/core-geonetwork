package org.fao.geonet.services.pigeosolutions.ndvi;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.fao.geonet.ApplicationContextHolder;
import org.fao.geonet.kernel.GeonetworkDataDirectory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.util.Arrays;

//=============================================================================

/** Returns the list of NDVI-like files, in the specified folder, ordered alphabetically
 */

@Controller("pigeo.ndvi.listfiles")
public class ListFiles
{
    private final String BASE_PATH = "/home/large/geoserver-prod-datadir/data/afo/rast/5_ndvi";
    private final String EXT = "tif";


    @RequestMapping(value="/{lang}/pigeo.ndvi.listfiles")
    @ResponseBody
    public JSONObject exec(@RequestParam (defaultValue = "NDVI") String dataName) throws Exception
    {
        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        GeonetworkDataDirectory dataDirectory = appContext.getBean(GeonetworkDataDirectory.class);

        String path = dataDirectory.getSystemDataDir()+File.separator+BASE_PATH+File.separator+dataName;
        if (BASE_PATH.startsWith("/")) { //then it is an absolute URL
            path = BASE_PATH+File.separator+dataName;
        }
        String ext = EXT;
        if (path == null || ext==null) {
            String error = "Error recovering the params : "+path+"(path) / "+ext+"(ext)";
            System.out.println(error);
            JSONObject res = new JSONObject();
            res.put("success", false);
            res.put("error", error);
            return res;
        }
        JSONObject params = new JSONObject();
        params.put("dataName", dataName);

        JSONObject res = new JSONObject();
        res.put("path", path);
        res.put("EXT", EXT);
        res.put("params", params);

        JSONArray fileList = new JSONArray();
        res.put("files", fileList);

        String files;
        try {
            File folder = new File(path);
            if (folder.canRead()) {
                File[] listOfFiles = folder.listFiles();
                Arrays.sort(listOfFiles);
                for (int i = 0; i < listOfFiles.length; i++)
                {
                    if (listOfFiles[i].isFile())
                    {
                        files = listOfFiles[i].getName();
                        if (files.endsWith(ext))
                        {
                            fileList.add(files);
                        }
                    }
                }
            }
        } catch (Exception problem) {
            problem.printStackTrace();
        } finally {
        }
        return res;
    }
}

//=============================================================================


