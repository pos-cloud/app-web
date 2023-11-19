import {IsDefined, IsEmail, IsString, MinLength} from 'class-validator'

class LogInDto {
  @IsDefined()
  @IsEmail()
  @IsString()
  public email: string

  @IsDefined()
  @MinLength(6)
  @IsString()
  public password: string
}

export default LogInDto
