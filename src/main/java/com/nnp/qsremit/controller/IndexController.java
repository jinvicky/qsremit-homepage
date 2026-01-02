/**
 * 개발자 : 김영하
 * 개발일 : 2024년 11월 23일
 * 개발목적 :
 * Spring MVC 컨트롤러로써, 클라이언트 요청에 따라 페이지를 반환하거나 서비스 로직을 연결합니다.
 * 주요 내용:
 * 1. 로그인 페이지 이동.
 * 2. 대시보드 및 기타 뷰 처리.
 * 참고 :
 - 파일 업로드 디렉토리: `System.getProperty("user.dir") + /uploads/`.
 - `UserService` 등 Spring 서비스 계층과 연동.
  - 파일 업로드는 `ExcelReader` 클래스 등 유틸리티를 사용.
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 03월 20일
 - 내용 :  `@GetMapping("/login")` 메서드에서 반환 값 변경.
 - 기존: `"login"` - 변경: `"userLogin"`
 2. 수정자 / 일자 : 김연주 / 2025년 03월 24일
 - 내용 : LocalDateTime에서 OffsetDateTime으로 변경
 - 기존 LocalDateTime은 시간대(time zone) 정보를 포함하지 않아 DB 시간과 로컬 시간이
 - 달라지는 문제가 발생했음. OffsetDateTime을 사용하여 시간대 정보를 저장함으로써,
 - DB와 로컬 시간 차이를 해결하고 일관된 시간 데이터를 관리할 수 있도록 개선함.
 3. 수정자 / 일시 : 김연주 / 2025년 3월 31일
 - 내용 : 권한에 따른 메인 페이지 분기
 4. 수정자 / 일시 : 최유진 / 2025년 04월 21일
 - 내용 : 사용하지 않는 Service 레이어 의존성 및 파일 upload 메소드 삭제
 5. 수정자 / 일시 : 김연주 / 2025년 06월 30일
 - 내용 : 권한 없는 사용자의 로그인 페이지 경로를 'login'에서 'userLogin'으로 수정
 6. 수정자 / 일시 : 김연주 / 2025년 07월 18일
 - 내용 : 모바일 계정 및 데이터 삭제 안내 메서드 추가
 7. 수정자 / 일시 : 김연주 / 2025년 08월 12일
 - 내용 : 사용자 계정 비밀번호 초기화 화면 및 이메일로 초기화 메서드 추가
 8. 수정자 / 일시 : 최유진 / 2025년 08월 25일
 - 내용 : error페이지 매핑 추가
 9. 수정자 / 일시 : 김연주 / 2025년 09월 30일
 - 내용 : 비밀번호 리셋 로직 user id 추가 검증
 10. 수정자 / 일자 : 김연주 / 2025년 10월 14일
 - 내용 : REMIT_ADMIN 접근 권한 추가
 */
package com.nnp.qsremit.controller;

import com.nnp.qsremit.service.user.UserAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;
import java.util.Collection;

@Controller
@RequiredArgsConstructor
public class IndexController {
	private final UserAdminService userAdminService;

	@GetMapping("/login")
	String login() {
		return "userLogin";
	}

	@GetMapping("/dashboard")
	@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'REMIT_ADMIN', 'SUPER_AGENT', 'AGENT')")
	public String dashboard(Model model, Principal principal) {
		Collection<? extends GrantedAuthority> authorities = ((Authentication) principal).getAuthorities();

		boolean isSuperAdminOrAdmin = authorities.stream()
				.anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_SUPER_ADMIN")
						|| grantedAuthority.getAuthority().equals("ROLE_ADMIN")
						|| grantedAuthority.getAuthority().equals("ROLE_REMIT_ADMIN"));

		boolean isSuperAgentOrAgent = authorities.stream()
				.anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_SUPER_AGENT") || grantedAuthority.getAuthority().equals("ROLE_AGENT"));

		// 역할에 따라 다른 페이지 반환
		if (isSuperAdminOrAdmin) {
			model.addAttribute("title", "Dashboard1");
			return "index";
		} else if (isSuperAgentOrAgent) {
			model.addAttribute("title", "Dashboard");
			return "dashboardAgent";
		} else {
			return "userLogin";
		}
	}

	@GetMapping("/dashboard2")
	String dashboard2(Model model) {
		model.addAttribute("title", "Dashboard2");
		return "dashboard2";
	}
	
	@GetMapping("/dashboard3")
	String dashboard3(Model model) {
		model.addAttribute("title", "Dashboard3");
		return "dashboard3";
	}

	@GetMapping("/accountDeletion")
	String getCustomerDeletionInfo(Model model) {
		return "customerDeletionInfo";
	}

	@GetMapping("/reset")
	String showResetPasswordForm() {
		return "resetPassword";
	}



	@GetMapping("/error")
	public String handleError() {
		return "error";
	}

}