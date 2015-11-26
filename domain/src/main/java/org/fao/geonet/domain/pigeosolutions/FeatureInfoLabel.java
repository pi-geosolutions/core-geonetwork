package org.fao.geonet.domain.pigeosolutions;

import javax.persistence.*;

/**
 * Created by fgravin on 25/11/2015.
 */

@Entity
@Access(AccessType.PROPERTY)
@Table(name="geoportal.\"fiLabels\"")
public class FeatureInfoLabel {

    private String layername;
    private String json;

    @Id
    public String getLayername() {
        return layername;
    }

    public void setLayername(String layername) {
        this.layername = layername;
    }

    public String getJson() {
        return json;
    }

    public void setJson(String json) {
        this.json = json;
    }
}
