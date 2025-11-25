package com.example.omdb.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Rating {
    @JsonProperty("Source")
    private String source;
    
    @JsonProperty("Value")
    private String value;
    
    // Getters and Setters
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}