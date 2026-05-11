# korean-banking-email-parser

대한민국 은행 입출금 이메일 알림을 복호화하고 파싱합니다.

현재 아래의 은행을 지원합니다.

* NH농협

## 설치하기

```shell
yarn add @nemorize/korean-banking-email-parser
```

## 예시

```js
import { parse } from '@nemorize/korean-banking-email-parser'
import { readFile } from 'fs/promises';

const encryptedHtml = await readFile('./Message.html', 'utf-8');
console.log(
    await parse(encryptedHtml, '000-00-00000')
);

// Output: {
//   account: {
//     accountNumber: '301-****-1234-56',
//     accountHolder: '네모컴퍼니',
//     accountStatus: '정상',
//     balance: 100000,
//     availableBalance: 100000,
//   },
//   transactions: [
//     {
//       transactionDate: '2026/01/01',
//       type: 'deposit',
//       amount: 30000,
//       balanceAfter: 100000,
//       branch: '자금과',
//       bank: 'SC제일',
//       description: '홍길동'
//     }
//   ]
// }
```

# 보안 주의사항

이 라이브러리는 메일을 복호화하기 위해 `new JSDOM(_, { runScripts: 'dangerously' })` 옵션을 사용합니다. 신뢰할 수 없는 HTML 컨텐츠를 전달할 경우 심각한 보안 문제가 발생할 수 있습니다. 입출금 알림을 발송한 이메일 주소가 각 은행의 공식 이메일 주소가 맞는지, 위변조된 이메일이 아닌지 다시 한번 확인해야 합니다.

~~쓸데없이 html 파일을 보내며 고객을 위협하는 K-금융에게서 나 자신을 지키기 위해 충분한 노력을 다해야 합니다.~~

# API

### `parse`

```ts
parse(html: string, password: string, timeout: number) => Promise<{
    account: {
        accountNumber: string|null,
        accountHolder: string|null,
        accountStatus: string|null,
        balance: number|null,
        availableBalance: number|null,
    },
    transactions: {
        transactionDate: string|null,
        type: 'deposit'|'withdrawal'|null,
        amount: number|null,
        balanceAfter: number|null,
        branch: string|null,
        bank: string|null,
        description: string|null,
    }[],
}>
```

암호화된 HTML 컨텐츠를 복호화한 뒤, 복호화된 컨텐츠에서 필요한 데이터만 추출해 반환합니다.

* `html`: 암호화된 HTML 컨텐츠.
* `password`: 복호화를 위한 비밀번호. 일반적으로 생년월일 6자리 또는 사업자번호 10자리.
* `timeout`: 복호화 작업의 타임아웃. ms 단위.
* `account`: 계좌 정보.
  * `accountNumber`: 계좌번호. 은행에 따라 일부 번호가 마스킹 되어 있을 수 있음.
  * `accountHolder`: 예금주명.
  * `accountStatus`: 계좌의 상태. 지급정지, 압류 등의 정보를 표기하기 위한 용도로 추측됨.
  * `balance`: 계좌의 잔액. 아래의 트랜잭션이 모두 완료된 이후의 최종 잔액.
  * `availableBalance`: 계좌의 출금 가능 잔액. 잔액에서 압류된 금액을 제외한 금액으로 추측됨.
* `transactions`: 입출금 트랜잭션. 1개의 항목만 포함될 것으로 추측됨.
  * `transactionDate`: `YYYY/mm/dd` 포맷의 입출금 날짜.
  * `type`: 입금 또는 출금.
    * `'deposit'`: 입금.
    * `'withdrawal'`: 출금.
  * `amount`: 입출금 액수.
  * `balanceAfter`: 입출금 후 계좌의 잔액.
  * `branch`: 해당 트랜잭션이 이루어진 거래점.
  * `bank`: 해당 트랜잭션이 이루어진 은행명.
  * `description`: 입금자명 또는 출금통장기록.

# 기여

현재 극소수의 은행만을 지원하고 있습니다. 다른 은행들도 지원할 수 있도록 많은 기여 부탁드립니다.

새로운 은행의 파서를 기여하고자 할 경우, 해당 은행에서 수신한 이메일 첨부파일 및 비밀번호를 PR에 함께 동봉하여 정상 작동 여부를 테스트 할 수 있도록 해 주세요.

코드 없이 이메일 첨부파일만 기여하시는 것도 환영합니다. 이슈를 통해 이메일 첨부파일과 비밀번호를 동봉해 주시면 검토하여 반영토록 하겠습니다.

혹 계좌 정보가 공개적으로 업로드되지 않기를 원하신다면, `jiyong.kim@headercat.com`으로 메일을 발송해 주셔도 좋습니다.

# 라이선스

MIT 라이선스를 따릅니다.