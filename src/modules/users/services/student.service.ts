import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../app/shared/models/response/api.response';
import { StudentDto } from '../../../app/shared/models/dto/student.dto';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  
  constructor(private http: HttpClient) { }

  public getStudents() {
    return this.http.get<ApiResponse<Array<StudentDto>>>("/api/v1/students");
  }

  public getStudentById(id: String) {
    return this.http.get<ApiResponse<StudentDto>>(`/api/v1/students/${id}`);
  }

}
