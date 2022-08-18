package org.menlorobotics.rvr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan({ "org.menlorobotics.handlers" })
@ComponentScan({ "org.menlorobotics.rvr" })
@SpringBootApplication
public class RvrApplication {

	public static void main(String[] args) {
		SpringApplication.run(RvrApplication.class, args);
	}
}
