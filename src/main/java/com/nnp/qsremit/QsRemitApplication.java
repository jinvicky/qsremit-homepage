package com.nnp.qsremit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(scanBasePackages = "com.nnp.qsremit")
@EnableCaching
public class QsRemitApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(QsRemitApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(QsRemitApplication.class);
    }
}
