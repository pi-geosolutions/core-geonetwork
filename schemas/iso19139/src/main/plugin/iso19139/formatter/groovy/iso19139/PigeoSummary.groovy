package iso19139

import com.google.common.collect.Maps
import org.fao.geonet.services.metadata.format.FormatType
import org.fao.geonet.services.metadata.format.groovy.Environment
import org.fao.geonet.services.metadata.format.groovy.util.*
import org.fao.geonet.services.metadata.format.groovy.Functions
import org.fao.geonet.services.metadata.format.groovy.Handlers
import org.fao.geonet.services.metadata.format.groovy.template.*

/**
 *
 * @author Fgravin on 08/05/2016.
 */
class PigeoSummary extends Summary {

    def script;
    def dates;
    def contacts;
    def constraints;
    def pocontacts;
    def mdauthor;

    public PigeoSummary(Handlers handlers, Environment env, Functions functions) throws Exception {
        super(handlers, env, functions)
    }

    public FileResult getResult() throws Exception {
        HashMap<String, Object> params = Maps.newHashMap();

        params.put("logo", logo);
        params.put("title", title != null ? title : "");
        params.put("pageTitle", title != null ? title.replace('"', '\'') : "");
        params.put("abstract", abstr);
        params.put("thumbnail", thumbnailUrl());
        params.put("links", links);
        params.put("associated", associated);
        params.put("addOverviewNavItem", addOverviewNavItem);
        params.put("navBar", navBar);
        params.put("navBarOverflow", navBarOverflow);
        params.put("showNavOverflow", !navBarOverflow.isEmpty());
        params.put("addCompleteNavItem", addCompleteNavItem);
        params.put("content", content);
        params.put("extents", extent != null ? extent : "");
        params.put("formats", formats != null ? formats : "");
        params.put("keywords", keywords != null ? keywords : "");
        params.put("isHTML", env.getFormatType() == FormatType.html);
        params.put("isPDF", env.getFormatType() == FormatType.pdf);
        params.put("dates", dates);
        params.put("contacts", contacts);
        params.put("constraints", constraints);
        params.put("pocontacts", pocontacts);
        params.put("mdauthor", mdauthor);

        return handlers.fileResult("html/pigeo-view-header.html", params);
    }
}

