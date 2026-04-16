package com.tbank.tevent;

import org.springframework.boot.SpringApplication;

public class TestTeventApplication {

	public static void main(String[] args) {
		SpringApplication.from(TeventApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
