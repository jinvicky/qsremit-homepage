package com.nnp.qsremit.security;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class SessionListener implements HttpSessionListener {

    private static final Logger logger = LoggerFactory.getLogger(SessionListener.class);

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        logger.info("Session Created: id={}, creationTime={}", se.getSession().getId(), se.getSession().getCreationTime());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        logger.info("Session Destroyed: id={}, lastAccessedTime={}", se.getSession().getId(), se.getSession().getLastAccessedTime());
    }
}