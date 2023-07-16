import { NaverMapConfig } from "config/interface";

export class LocationUtil {
    constructor(
        private readonly naverMapConfig: NaverMapConfig,
    ) { }

    /**
     * 위도와 경도로 주소를 가져옵니다.
     * @param latitude 위도
     * @param longitude 경도
     * @returns 주소
     * @throws {Error} 주소를 가져오는데 실패했을 경우
     */

    async reverseGeocode(latitude: number, longitude: number): Promise<string> {
        const response = await fetch(
            "https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?" +
            new URLSearchParams(
                {
                    coords: `${longitude},${latitude}`,
                    output: "json",
                }
            ),
            {
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': this.naverMapConfig.accessKeyId,
                    'X-NCP-APIGW-API-KEY': this.naverMapConfig.secretAccessKey
                }
            }
        )

        // check status code
        if (response.status !== 200) {
            throw new Error("Failed to get address from Naver Map API")
        }

        // parse response
        const json = await response.json()

        // check status
        if (json.status.code !== 0) {
            throw new Error("Failed to get address from Naver Map API")
        }

        // return address
        const region = json.results[0].region
        return `${region.area2.name} ${region.area3.name}`
    }
}