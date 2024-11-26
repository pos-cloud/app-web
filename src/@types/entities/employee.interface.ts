import { Activity } from "@types";
import { EmployeeType } from "./employee-type.interface";

export interface Employee extends Activity{
	_id: string;
	name: string;
	phone: string;
	address: string;
	type: EmployeeType;
}