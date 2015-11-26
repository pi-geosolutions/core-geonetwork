package org.fao.geonet.domain.pigeosolutions;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by fgravin on 21/11/2015.
 */

@Entity
@Access(AccessType.PROPERTY)
@Table(name="geoportal.nodes")
@SequenceGenerator(name=LayerTreeNode.ID_SEQ_NAME, initialValue=1, allocationSize=1)
public class LayerTreeNode {

    static final String ID_SEQ_NAME = "nodes_id_seq";

    private int id;
    private int parentid;
    private int weight;
    private String isfolder;
    private String json;
    private Date lastchanged;

    public Date getLastchanged() {
        return lastchanged;
    }

    public void setLastchanged(Date lastchanged) {
        this.lastchanged = lastchanged;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = ID_SEQ_NAME)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getParentid() {
        return parentid;
    }

    public void setParentid(int parentid) {
        this.parentid = parentid;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public String getIsfolder() {
        return isfolder;
    }

    public void setIsfolder(String isfolder) {
        this.isfolder = isfolder;
    }

    public String getJson() {
        return json;
    }

    public void setJson(String json) {
        this.json = json;
    }
}
