package com.example.omdb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MovieExplorerApplication {
    public static void main(String[] args) {
        SpringApplication.run(MovieExplorerApplication.class, args);
    }
}