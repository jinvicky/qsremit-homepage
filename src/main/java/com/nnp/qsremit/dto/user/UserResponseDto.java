/**
 * 개발자 : 김연주
 * 개발일 : 2025년 03월 13일
 * 개발목적 :
 * 사용자 데이터를 클라이언트로 전달하기 위한 Data Transfer Object(DTO) 클래스입니다.
 *
 * 주요 역할 :
 * - 사용자 정보를 간결하게 표현하여 클라이언트에게 반환
 * - Entity 클래스와 분리하여 필요 정보만 제공
 * - `UserEntity`의 특정 필드를 포함하여 효율적인 데이터 구성
 *
 * 주요 필드 :
 * 1. `id` : 사용자 고유 ID (Primary Key).
 * 2. `userType` : 사용자 유형 (Enum 타입).
 * 3. `userId` : 사용자의 고유 아이디.
 * 4. `name` : 사용자의 이름.
 * 5. `createAt` : 사용자 데이터가 생성된 시간.
 *
 * 참고 :
 * - `@Getter` : 모든 필드에 대해 읽기 전용 접근자(Getter) 자동 생성.
 * - `@AllArgsConstructor` : 모든 필드를 초기화하는 생성자 자동 생성.
 * - 해당 클래스는 유지보수성과 코드 재사용성을 높이기 위한 DTO의 표준 구현 사례.
 * 수정사항 :
 *    1. 수정자 / 일자 : 김연주 / 2025년 03월 24일
 *         - 내용 : LocalDateTime에서 OffsetDateTime으로 변경
 *          기존 LocalDateTime은 시간대(time zone) 정보를 포함하지 않아 DB 시간과 로컬 시간이
 *          달라지는 문제가 발생했음. OffsetDateTime을 사용하여 시간대 정보를 저장함으로써,
 *          DB와 로컬 시간 차이를 해결하고 일관된 시간 데이터를 관리할 수 있도록 개선함.
 *
 */
package com.nnp.qsremit.dto.user;


import com.nnp.qsremit.Entity.user.UserType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private UserType userType;
    private String userId;
    private String name;
    private OffsetDateTime createAt;
}
