package com.fromsub.demo.model;

public enum WorkTeam {
    DEV("Development"),
    DEVOPS("DevOps"),
    TESTING("Testing"),
    MARKETING("Marketing");

    private final String displayName;

    WorkTeam(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
