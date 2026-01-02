package com.nnp.qsremit.controller.home;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller()
@RequestMapping("/kr")
public class kr_HomeController {

    private void setCommonAttributes(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "kr");
        String currentPath = request.getRequestURI();
        String pathWithoutLang = currentPath.replaceFirst("^/(kr|en|ja)", "");
        model.addAttribute("currentPath", currentPath);
        model.addAttribute("pathWithoutLang", pathWithoutLang);
    }

    @GetMapping
    public String homePage(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/Home";
    }

    @GetMapping("/About")
    public String About( Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "/kr/About";
    }

    @GetMapping("/HowToSendMoney")
    public String HowToSendMoney(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/HowToSendMoney";
    }

    @GetMapping("/Branches")
    public String Branches(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/Branches";
    }

    @GetMapping("/HowToRegister")
    public String HowToRegister(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/HowToRegister";
    }

    @GetMapping("/notice")
    public String notice(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/notice";
    }

    @GetMapping("/TrackTransaction")
    public String TrackTransaction(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/TrackTransaction";
    }

    @GetMapping("/Terms01")
    public String Terms01(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/Terms/Terms01";
    }

    @GetMapping("/Terms02")
    public String Terms02(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/Terms/Terms02";
    }

    @GetMapping("/Terms03")
    public String Terms03(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/Terms/Terms03";
    }

    @GetMapping("/Terms04")
    public String Terms04(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/Terms/Terms04";
    }

    @GetMapping("/Terms05")
    public String Terms05(Model model, HttpServletRequest request) {
        setCommonAttributes(model, request);
        return "kr/Terms/Terms05";
    }
}
