package org.fao.geonet.pigeosolutions.geoportal.services.animations;

import jeeves.server.context.ServiceContext;
import jeeves.server.dispatchers.ServiceManager;
import org.fao.geonet.exceptions.ResourceNotFoundEx;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.NativeWebRequest;

import javax.servlet.http.HttpServletRequest;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

//http://localhost:8080/geonetwork/srv/fre/pigeo.animations.getimage?path=d:/pigeo_data/animations\\eumetsat&fname=mpe_160512_0932.png

@Controller()
public class GetImage
{
    @Autowired
    private ServiceManager serviceManager;


    @RequestMapping(value="/{lang}/pigeo.animations.getimage", produces= MediaType.IMAGE_JPEG_VALUE)
    @ResponseBody
    public HttpEntity<byte[]> exec(@PathVariable String lang,
                       @RequestParam String path,
                       @RequestParam String fname,
                       NativeWebRequest request) throws Exception {

        final HttpServletRequest httpServletRequest = request.getNativeRequest(HttpServletRequest.class);
        final ServiceContext context = serviceManager.createServiceContext("resources.get", lang, httpServletRequest);

        Path dir = Paths.get(path);
        Path file= dir.resolve(fname);

        if (!Files.exists(file))
            throw new ResourceNotFoundEx(fname);

        return new HttpEntity<>(Files.readAllBytes(file));
    }
}

//=============================================================================


