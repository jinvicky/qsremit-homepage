/**
 * 개발자 : 김연주
 * 개발일 : 2025년 03월 13일
 * 개발목적 :
 *           UserSecurityDto 클래스는 Spring Security의 User 클래스를 확장하여
 *           애플리케이션에서 사용자 정보를 담고, 인증 및 권한 관리를 위해 설계되었습니다.
 *           사용자 ID, 비밀번호, 이름, 이메일, 사용자 유형 등의 정보를 포함하며,
 *           Security와의 통합을 위해 권한(Role) 설정도 제공합니다.
 * 참고 :
 *           - Spring Security User 클래스
 *           - lombok 라이브러리(@Getter, @Setter, @ToString)
 * 수정사항 :
 *    1. 수정자 / 일자 :
 *         - 내용 :
 */
package com.nnp.qsremit.dto.user;

import com.nnp.qsremit.Entity.user.UserType;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.List;

@Getter
@Setter
@ToString
public class UserSecurityDto extends User {

    private Long id;
    private String userId;
    private String password;
    private UserType userType;
    private String name;
    private String email;
    private String mobile;
    private boolean transactionReport;
    private boolean resetPassword;

    private boolean deleted;

    public UserSecurityDto(Long id, String username, String password,
                           UserType userType, String name, String email, String mobile,
                           boolean transactionReport, boolean deleted, boolean resetPassword) {
        super(username, password, List.of(new SimpleGrantedAuthority("ROLE_" + userType.name())));

        this.id = id;
        this.userId = username;
        this.password = password;
        this.name = name;
        this.userType = userType;
        this.email = email;
        this.mobile = mobile;
        this.transactionReport = transactionReport;
        this.deleted = deleted;
        this.resetPassword = resetPassword;
    }
}
