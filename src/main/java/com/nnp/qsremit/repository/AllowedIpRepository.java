/**
* 개발자 : 김연주
* 개발일 : 2025년 04월 15일
* 개발목적 : Allowed IP 관리를 위한 Repository 생성
* 참고 : Spring Data JPA
* 수정사항 :
1. 수정자 / 일자 : 김연주 / 2025년 6월 27일
- 내용 : 유효한 Allowed IP 조회용 쿼리 메서드 findValidIp 추가
*/
package com.nnp.qsremit.repository;

import com.nnp.qsremit.Entity.AllowedIpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface AllowedIpRepository extends JpaRepository<AllowedIpEntity, Long> {
    @Query("""
        SELECT a FROM AllowedIpEntity a
        WHERE a.ipAddress = :ip
          AND (a.validFrom IS NULL OR a.validFrom <= :now)
          AND (a.validTo   IS NULL OR a.validTo   >= :now)
    """)
    Optional<AllowedIpEntity> findValidIp(@Param("ip") String ip,
                                          @Param("now") OffsetDateTime now);
}
