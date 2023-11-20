import {IsDefined, IsString} from 'class-validator'

class RefreshTokenDto {
  @IsDefined()
  @IsString()
  public refreshToken: string
}

export default RefreshTokenDto
