package iso19139

import org.fao.geonet.api.records.formatters.FormatType
import org.fao.geonet.api.records.formatters.groovy.Environment
import org.fao.geonet.api.records.formatters.groovy.util.*

/**
 * Creates the {@link org.fao.geonet.services.metadata.format.groovy.util.Summary} instance for the iso19139 class.
 *
 * @author Fgravin on 08/05/2016.
 */
class PigeoSummaryFactory {
    def isoHandlers;
    org.fao.geonet.api.records.formatters.groovy.Handlers handlers
    org.fao.geonet.api.records.formatters.groovy.Functions f
    Environment env

    def navBarItems

    /*
     * This field can be set by the creator and provided a closure that will be passed the summary object.  The closure can
     * perform customization for its needs.
     */
    Closure<Summary> summaryCustomizer = null

    PigeoSummaryFactory(isoHandlers, summaryCustomizer) {
        this.isoHandlers = isoHandlers
        this.handlers = isoHandlers.handlers;
        this.f = isoHandlers.f;
        this.env = isoHandlers.env;
        this.navBarItems = []
        this.summaryCustomizer = summaryCustomizer;
    }
    PigeoSummaryFactory(isoHandlers) {
        this(isoHandlers, null)
    }

    static void summaryHandler(select, isoHandler) {
        def factory = new PigeoSummaryFactory(isoHandler)
        factory.handlers.add name: "Summary Handler", select: select, {factory.create(it).getResult()}
    }

    PigeoSummary create(metadata) {

        PigeoSummary summary = new PigeoSummary(this.handlers, this.env, this.f)

        summary.title = this.isoHandlers.isofunc.isoText(metadata.'gmd:identificationInfo'.'*'.'gmd:citation'.'gmd:CI_Citation'.'gmd:title')
        summary.abstr = this.isoHandlers.isofunc.isoText(metadata.'gmd:identificationInfo'.'*'.'gmd:abstract').replaceAll("\n", "<br>")

        configureKeywords(metadata, summary)
        //configureFormats(metadata, summary)
        configureExtent(metadata, summary)
        configureThumbnails(metadata, summary)
        configureDataQualityInfo(metadata, summary)
        configureDates(metadata, summary)
        configureContacts(metadata, summary)
        configureConstraints(metadata, summary)

        LinkBlock linkBlock = new LinkBlock('links', "fa fa-link");
        configureLinks(linkBlock, 'link', false, {
            def linkParts = it.split("\\|")
            [
                    title   : isoHandlers.isofunc.clean(linkParts[0]),
                    desc    : isoHandlers.isofunc.clean(linkParts[1]),
                    href    : isoHandlers.isofunc.clean(linkParts[2]),
                    protocol: isoHandlers.isofunc.clean(linkParts[3])
            ]
        })

        if (!linkBlock.links.isEmpty()) {
            summary.links.add(linkBlock)
        }

        /*
         * TODO fix the xslt transform required by loadHierarchyLinkBlocks when running tests.
         */


        if (env.formatType == FormatType.pdf/* || env.formatType == FormatType.testpdf */) {
            summary.associated.add(isoHandlers.commonHandlers.loadHierarchyLinkBlocks())
        } else {
            summary.associated.add(createDynamicAssociatedHtml(summary))
        }

        def toNavBarItem = {s ->
            def name = f.nodeLabel(s, null)
            def abbrName = f.nodeTranslation(s, null, "abbrLabel")
            new NavBarItem(name, abbrName, '.' + s.replace(':', "_"))
        }

        summary.navBar = this.isoHandlers.packageViews.findAll{navBarItems.contains(it)}.collect (toNavBarItem)
        summary.navBarOverflow = new  ArrayList<String>()
        summary.content = this.isoHandlers.rootPackageEl(metadata)

        if (summaryCustomizer != null) {
            summaryCustomizer(summary);
        }

        return summary
    }

    def configureKeywords(metadata, summary) {
        def keywords = metadata."**".findAll{it.name() == 'gmd:descriptiveKeywords'}
        if (!keywords.isEmpty() && keywords.get(0)) {
            def ks = this.isoHandlers.keywordsElPigeo(keywords)
            if(ks) summary.keywords = ks.toString()
        }
    }
    def configureFormats(metadata, summary) {
        def formats = metadata."**".findAll this.isoHandlers.matchers.isFormatEl
        if (!formats.isEmpty()) {
            summary.formats = this.isoHandlers.formatEls(formats).toString()
        }
    }
    def configureDates(metadata, summary) {
        def dates = metadata.'gmd:identificationInfo'.'*'.'gmd:citation'."**".findAll{it.name() == 'gmd:CI_Date'}
        if (!dates.isEmpty()) {
            summary.dates = this.isoHandlers.datesElPigeo(dates).toString()
        }
    }

    def configureContacts(metadata, summary) {
        def mdauthor = metadata.'gmd:contact'.'gmd:CI_ResponsibleParty'
        if (mdauthor != null) {
            summary.mdauthor = this.isoHandlers.contactsElPigeo(mdauthor).toString()
        }

        def pocontacts = metadata."**".findAll{it.name() == 'gmd:pointOfContact'}
        if (!pocontacts.isEmpty()) {
            summary.pocontacts = this.isoHandlers.contactsElPigeo(pocontacts.'gmd:CI_ResponsibleParty').toString()
        }
    }

    def configureConstraints(metadata, summary) {
        def constraints = metadata."**".findAll{it.name() == 'gmd:MD_LegalConstraints'}
        if (!constraints.isEmpty()) {
            summary.constraints = this.isoHandlers.constraintsElPigeo(constraints).toString()
        }
    }

    def configureExtent(metadata, summary) {
        def extents = metadata."**".findAll { this.isoHandlers.matchers.isPolygon(it) || this.isoHandlers.matchers.isBBox(it) }
        def split = extents.split this.isoHandlers.matchers.isPolygon

        def polygons = split[0]
        def bboxes = split[1]

        def extent = ""
        if (!polygons.isEmpty()) {
            extent = this.isoHandlers.polygonEl(true)(polygons[0]).toString()
        } else if (!bboxes.isEmpty()) {
            extent = this.isoHandlers.bboxElPigeo(true)(bboxes[0]).toString()
        }
        summary.extent = extent
    }

    def configureDataQualityInfo(metadata, summary) {
        def statementsElts = metadata."**".findAll{it.name() == 'gmd:statement'}
        def statementsString = []
        statementsElts.collectNested {metadata.'**'.findAll{it.name() == 'gmd:statement'}}.flatten().each { k ->
            statementsString.add(this.isoHandlers.isofunc.isoText(k))
        }

        if (!statementsString.isEmpty() && statementsString.get(0)) {
            summary.formats = this.isoHandlers.dataQualityInfoElPigeo(statementsString).toString()
        }
    }

    def createCollapsablePanel() {

/*
        def js = this.handlers.fileResult("js/utils.js", null)
        def htmlOrXmlEnd = {
            def required = """
            <script type="text/javascript">
            //<![CDATA[
                gnFormatter.formatterOnComplete();

            $js
                //]]></script>
            """
        }
        handlers.end htmlOrXmlEnd
*/
    }

    private static void configureThumbnails(metadata, header) {
        def logos = metadata.'gmd:identificationInfo'.'*'.'gmd:graphicOverview'.'gmd:MD_BrowseGraphic'.'gmd:fileName'.'gco:CharacterString'

        logos.each { logo ->
            header.addThumbnail(logo.text())
        }
    }

    def configureLinks(linkBlock, indexKey, urlAndTextEquals, objParser) {
        Collection<String> links = this.env.indexInfo[indexKey];
        if (links != null && !links.isEmpty()) {

            links.each { link ->
                def linkParts = objParser(link)
                def title = linkParts.title
                def desc = linkParts.desc
                def href = linkParts.href
                if (title.isEmpty()) {
                    title = desc;
                }
                if (title.isEmpty()) {
                    title = href;
                }

                if (href != '') {
                    def protocol = linkParts.protocol != null ? linkParts.protocol.toLowerCase() : '';
                    def linkClass = href.isEmpty() ? 'text-muted' : '';

                    def imagesDir = "../../images/formatter/"
                    def type;
                    def icon = "";
                    def iconClasses = "";
                    if (protocol.contains("kml")) {
                        type = "kml";
                        icon = imagesDir + "kml.png";
                    } else if (protocol.contains("wms")) {
                        type = "wms";
                        icon = imagesDir + "wms.png";
                    } else if (protocol.contains("download")) {
                        type = "download";
                        iconClasses = "fa fa-download"
                    } else if (protocol.contains("wfs")) {
                        type = "wfs";
                        icon = imagesDir + "wfs.png";
                    } else if (protocol.contains("ogc:")) {
                        type = "ogc";
                    } else {
                        if (indexKey == 'wms_uri' ) {
                            type = "wms";
                            icon = imagesDir + "wms.png";
                        } else {
                            type = "link";
                            iconClasses = "fa fa-link"
                        }
                    }

                    def linkType = new LinkType(type, null, icon, iconClasses)

                    def linkObj = new Link(href, title, linkClass)
                    if (urlAndTextEquals) {
                        linkBlock.linkMap.put(linkType, linkObj);
                    } else {
                        linkBlock.put(linkType, linkObj)
                    }
                }
            }
        }
    }

    LinkBlock createDynamicAssociatedHtml(Summary summary) {
        def associated = "associated-link"

        def html = """
<script type="text/javascript">
//<![CDATA[
gnFormatter.loadAssociated(undefined, '.${LinkBlock.CSS_CLASS_PREFIX + associated}', ${this.env.metadataId}, undefined, '.associated-spinner')
//]]></script>
<div><i class="fa fa-circle-o-notch fa-spin pad-right associated-spinner"></i>Loading...</div>
"""

        LinkBlock linkBlock = new LinkBlock(associated, "fa fa-sitemap")
        linkBlock.html = html
        return linkBlock;
    }

}
