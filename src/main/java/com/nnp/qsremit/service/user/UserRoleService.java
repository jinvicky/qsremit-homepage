/**
 * 개발자 : 김연주
 * 개발일 : 2025년 07월 04일
 * 개발목적 :
 - 사용자 역할(Role) 업데이트를 담당하는 서비스 클래스입니다.
 * 참고 :
 - `@Service`: Spring의 서비스 레이어를 나타냅니다.
 - `@Transactional`: 트랜잭션 처리를 통해 데이터 일관성을 보장합니다.
 - `@SuperAdminOnly`: `SUPER_ADMIN` 권한만 해당 메서드를 호출할 수 있도록 제한합니다.
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */
package com.nnp.qsremit.service.user;


import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.Entity.user.UserType;
import com.nnp.qsremit.security.annotation.SuperAdminOnly;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserRoleService {

    @SuperAdminOnly
    @Transactional
    public void updateUserRole(UserEntity userEntity, UserType userType) {
        userEntity.setUserType(userType);
    }
}
