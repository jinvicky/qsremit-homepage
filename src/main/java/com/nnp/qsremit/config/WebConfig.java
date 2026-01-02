package com.nnp.qsremit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 파일 직접 매핑
        registry.addResourceHandler("/flags/**")
                .addResourceLocations("classpath:/static/flags/");

        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");

        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");

        registry.addResourceHandler("/backgrounds/**")
                .addResourceLocations("classpath:/static/backgrounds/");

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}
