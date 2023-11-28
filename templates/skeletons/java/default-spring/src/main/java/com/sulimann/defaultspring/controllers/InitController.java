package com.sulimann.defaultspring.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InitController {

    @GetMapping(value = "/init")
    public ResponseEntity<Object> init(){
        return ResponseEntity.status(HttpStatus.OK).body("Get realizado com sucesso!");
    }
    
}
