package com.nnp.qsremit.controller.home;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.ui.Model;

@Controller()
@RequestMapping("/")
public class jp_HomeController {

    @GetMapping
    public String homePage(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/Home";
    }

    @GetMapping("/About")
    public String About(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/About";
    }

    @GetMapping("/HowToSendMoney")
    public String HowToSendMoney(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/HowToSendMoney";
    }

    @GetMapping("/Branches")
    public String Branches(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/Branches";
    }

    @GetMapping("/HowToRegister")
    public String HowToRegister(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/HowToRegister";
    }

    @GetMapping("/notice")
    public String notice(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/notice";
    }

    @GetMapping("/TrackTransaction")
    public String TrackTransaction(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/TrackTransaction";
    }

    @GetMapping("/Terms01")
    public String Terms03(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/Terms/Terms01";
    }

    @GetMapping("/Terms02")
    public String Terms02(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/Terms/Terms02";
    }

    @GetMapping("/Terms03")
    public String Terms01(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/Terms/Terms03";
    }

    @GetMapping("/Terms04")
    public String Terms04(Model model, HttpServletRequest request) {
        model.addAttribute("lang", "jp");
        model.addAttribute("currentPath", request.getRequestURI());
        return "jp/Terms/Terms04";
    }
}
