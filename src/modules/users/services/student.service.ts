import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  
  constructor(private http: HttpClient) { }

  public getStudents() {
    return this.http.get("/api/v1/students");
  }

  public getStudentById(id: String) {
    return this.http.get(`/api/v1/students/${id}`);
  }

}
