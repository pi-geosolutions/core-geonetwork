package org.fao.geonet.pigeosolutions.geoportal.services.featureinfos;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.fao.geonet.ApplicationContextHolder;
import org.fao.geonet.domain.pigeosolutions.FeatureInfoLabel;
import org.fao.geonet.repository.pigeosolutions.FeatureInfoLabelRepository;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Iterator;
import java.util.List;

/**
 * Created by fgravin on 21/11/2015.
 */

@Controller("pigeo.featureinfos")
public class FeatureInfoLabelService {

    @RequestMapping(value="/{lang}/pigeo.featureinfos.get", produces= MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public JSONArray get()  {

        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        FeatureInfoLabelRepository repository = appContext.getBean(FeatureInfoLabelRepository.class);

        List<FeatureInfoLabel> labels = repository.findAll();
        JSONArray res = new JSONArray();
        for (FeatureInfoLabel label : labels) {
            JSONObject row = JSONObject.fromObject(label.getJson());
            row.put("layername", label.getLayername());
            res.add(row);
        }
        return res;
    }

    @RequestMapping(value="/{lang}/pigeo.featureinfos.set", produces= MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public JSONObject set(@RequestParam String layers) throws Exception {

        ConfigurableApplicationContext appContext = ApplicationContextHolder.get();
        FeatureInfoLabelRepository repository = appContext.getBean(FeatureInfoLabelRepository.class);
        JSONObject res = new JSONObject();
        JSONArray layersJson = JSONArray.fromObject(layers);

        Iterator it = layersJson.iterator();
        while (it.hasNext()) {
            JSONObject layer = (JSONObject)it.next();
            FeatureInfoLabel fiLabel = new FeatureInfoLabel();
            fiLabel.setLayername(layer.getString("layername"));
            fiLabel.setJson(layer.toString());

            repository.save(fiLabel);
        }
        repository.flush();
        return res;
    }

}