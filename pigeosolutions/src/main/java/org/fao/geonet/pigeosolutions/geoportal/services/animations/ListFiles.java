package org.fao.geonet.pigeosolutions.geoportal.services.animations;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.fao.geonet.ApplicationContextHolder;
import org.fao.geonet.kernel.GeonetworkDataDirectory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.util.Arrays;


//http://localhost:8080/geonetwork/srv/fre/pigeo.animations.listfiles?dataName=eumetsat

@Controller
public class ListFiles
{
    //private final String BASE_PATH = "d:/pigeo_data/animations";
    private final String BASE_PATH = "/home/jean/tomcat7/data/geoportal-global/animations";
    private final String EXT = "png";

    private String basePath;
    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }

    private @Value("${animations.path}") String path;

    @RequestMapping(value="/{lang}/pigeo.animations.listfiles")
    @ResponseBody
    public JSONObject exec(@RequestParam(defaultValue = "NDVI") String dataName) throws Exception
    {

        // TODO: 27/10/16 Fix spring to load the bean once with pigeo.properties
        this.basePath = BASE_PATH; //"/home/florent/dev/DATA_DIR/img/animations";
        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        GeonetworkDataDirectory dataDirectory = appContext.getBean(GeonetworkDataDirectory.class);

        String path = dataDirectory.getSystemDataDir()+File.separator+basePath+File.separator+dataName;
        if (basePath.startsWith("/")) { //then it is an absolute URL
            path = basePath+File.separator+dataName;
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


