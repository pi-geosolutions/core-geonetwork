package org.fao.geonet.pigeosolutions.geoportal.services.animations;

import org.fao.geonet.exceptions.ResourceNotFoundEx;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

//http://localhost:8080/geonetwork/srv/fre/pigeo.animations.getimage?path=d:/pigeo_data/animations\\eumetsat&fname=mpe_160512_0932.png

@Controller
public class GetImage
{

    @RequestMapping(value="/{lang}/pigeo.animations.getimage", produces= MediaType.IMAGE_JPEG_VALUE)
    @ResponseBody
    public HttpEntity<byte[]> exec(
                       @RequestParam String path,
                       @RequestParam String fname
                       ) throws Exception {

        Path dir = Paths.get(path);
        Path file= dir.resolve(fname);

        if (!Files.exists(file))
            throw new ResourceNotFoundEx(fname);

        return new HttpEntity<>(Files.readAllBytes(file));
    }
}

//=============================================================================


