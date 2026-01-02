/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 05월 13일
 * 개발목적 : GME(PG) 관리 화면을 제공 및 처리하기 위한 컨트롤러.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 05월 26일
 - 내용 : EC 권한 추가
 2. 수정자 / 일자 : 한서흔 / 2025년 06월 25일
 - 내용 : Customer Type 테이블과의 데이터 연동을 위한 Model 추가.
 3. 수정자 / 일자 : 한서흔 / 2025년 07월 01일
 - 내용 : Customer Types 정렬 후 데이터 전송을 위한 코드 추가.
 4. 수정자 / 일자 : 한서흔 / 2025년 07월 07일
 - 내용 : orderNo로 정렬 방식 변경.
 5. 수정자 / 일자 : 한서흔 / 2025년 09월 03일
 - 내용 : httpUtils.unescapeAllStrings 추가.
 6. 수정자 / 일자 : 한서흔 / 2025년 09월 26일
 - 내용 : EC_ADMIN 권한 추가.
 */

package com.nnp.qsremit.controller.pgManagement.accountDepositManagement;

import com.nnp.qsremit.service.util.HttpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class AccountDepositManagementController {

//    @Autowired
//    private AccountDepositTypeRepository accountDepositTypeRepository;
    @Autowired
    private HttpUtils httpUtils;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'EC', 'EC_ADMIN')")
    @GetMapping("/pgManagement/accountDepositManagement")
    public String AccountDepositManagement(Model model) {
        model.addAttribute("title", "Account Deposit Management");

//        List<AccountDepositTypeEntity> customerTypes = accountDepositTypeRepository.findAll();
//        customerTypes.sort((a, b) -> {
//            int nullableCompare = Boolean.compare(a.getIsNullable(), b.getIsNullable());
//            if (nullableCompare != 0) {
//                return nullableCompare;
//            }
//
//            if (!a.getIsNullable() && !b.getIsNullable()) {
//                if (a.getOrderNo() == null && b.getOrderNo() == null) {
//                    return a.getCustomerType().compareToIgnoreCase(b.getCustomerType());
//                }
//                if (a.getOrderNo() == null) return 1;
//                if (b.getOrderNo() == null) return -1;
//
//                int orderCompare = a.getOrderNo().compareTo(b.getOrderNo());
//                if (orderCompare != 0) {
//                    return orderCompare;
//                }
//
//                // orderNo가 같을 경우 → 이름순
//                return a.getCustomerType().compareToIgnoreCase(b.getCustomerType());
//            }
//
//            return 0;
//        });
//
//        customerTypes = (List<AccountDepositTypeEntity>) httpUtils.unescapeAllStrings(customerTypes);
//
//        model.addAttribute("customerTypes", customerTypes);

        return "pgManagement/accountDepositManagement";
    }
}
