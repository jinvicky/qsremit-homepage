/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 02일
 * 개발목적 : Daily Summary Management 화면 구성을 위한 Controller.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 09월 24일
 - 내용 : Daily Summary 조회용 Customer Type 목록 전달.
 */

package com.nnp.qsremit.controller.pgManagement.dailySummaryManagement;

import com.nnp.qsremit.service.util.HttpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class DailySummaryController {

//    @Autowired
//    private AccountDepositTypeRepository accountDepositTypeRepository;
    @Autowired
    private HttpUtils httpUtils;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'EC_ADMIN')")
    @GetMapping("/pgManagement/dailySummaryManagement")
    public String DailySummaryManagement(Model model) {
        model.addAttribute("title", "Daily Summary Management");

//        List<AccountDepositTypeEntity> customerTypes = accountDepositTypeRepository.findAllActiveCustomerType();
//        customerTypes = (List<AccountDepositTypeEntity>) httpUtils.unescapeAllStrings(customerTypes);
//
//        model.addAttribute("customerTypes", customerTypes);

        return "pgManagement/dailySummaryManagement";
    }
}
