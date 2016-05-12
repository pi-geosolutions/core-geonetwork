package org.fao.geonet.pigeosolutions.geoportal.services.animations;

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


//http://localhost:8080/geonetwork/srv/fre/pigeo.animations.listfiles?dataName=eumetsat

@Controller("pigeo.animations.listfiles")
public class ListFiles
{
    private final String BASE_PATH = "d:/pigeo_data/animations";
    private final String EXT = "png";

    @RequestMapping(value="/{lang}/pigeo.animations.listfiles")
    @ResponseBody
    public JSONObject exec(@RequestParam(defaultValue = "NDVI") String dataName) throws Exception
    {

        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        GeonetworkDataDirectory dataDirectory = appContext.getBean(GeonetworkDataDirectory.class);

        String path = dataDirectory.getSystemDataDir()+File.separator+BASE_PATH+File.separator+dataName;
        if (BASE_PATH.startsWith("d:")) { //then it is an absolute URL
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
            res.put("files", fileList);
        }
        return res;
    }
}


