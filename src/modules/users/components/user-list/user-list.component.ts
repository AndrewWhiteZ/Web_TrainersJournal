import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, TuiDialogContext, TuiDialogService, TuiIcon, TuiInitialsPipe, TuiLabel, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiChip, TuiConnected, TuiPagination, TuiPassword, TuiSkeleton, TuiStep, TuiStepper } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateModule, TuiInputModule, TuiInputNumberModule, TuiInputPhoneModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { FacadeService } from '../../../../app/shared/services/facade.service';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';
import { StudentMapper } from '../../../../app/shared/models/mapper/student.mapper';
import { TuiDay } from '@taiga-ui/cdk';
import { StudentSignUpRequest } from '../../../../app/shared/models/requests/student-sign-up.request';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus'; 
import { BeltLevelPipe } from '../../../../app/shared/pipes/belt-level.pipe';
import { BeltLevelColorPipe } from '../../../../app/shared/pipes/belt-level-color.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiAppearance,
    TuiCardLarge,
    TuiSearch,
    TuiTextfield,
    TuiButton,
    TuiHeader,
    TuiTitle,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiSkeleton,
    TuiCell,
    TuiAutoColorPipe,
    TuiPagination,
    TuiInitialsPipe,
    TuiAvatar,
    TuiInputDateModule,
    TuiInputNumberModule,
    TuiPassword,
    TuiInputNumberModule,
    TuiInputPhoneModule,
    TuiLabel,
    TuiIcon,
    TuiStepper,
    TuiStep,
    TuiConnected,
    TuiChip,
    BeltLevelPipe,
    BeltLevelColorPipe,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected skeletonStudents: boolean = true;

  protected length = 1;
  protected index = 1;
  protected activeTabIndex = 0;
  
  protected students: Array<StudentEntity> = new Array;

  protected readonly searchForm = new FormGroup({
    search: new FormControl(),
  });

  protected readonly addStudentForm = new FormGroup({
    login: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
    fullName: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
    email: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
    phone: new FormControl('88005553535', { validators: [Validators.required], nonNullable: true } ),
    password: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
    beltLevel: new FormControl(0, { validators: [Validators.required], nonNullable: true } ),
    birthDate: new FormControl(TuiDay.currentLocal(), { validators: [Validators.required], nonNullable: true } ),
    parentFullName: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
    parentPhone: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private facadeService: FacadeService
  ) {}
  
  ngOnInit(): void {
    this.getStudents();
  }

  protected getStudents(): void {
    this.skeletonStudents = true;
    this.facadeService.getStudents().subscribe({
      next: (response) => {
        this.students = new Array;
        response.data.map((dto) => this.students.push(StudentMapper.mapToEntity(dto)));
        this.students.sort((a, b) => a.beltLevel - b.beltLevel);
        this.skeletonStudents = false;
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected addStudent(observer: any): void {
    const controls = this.addStudentForm.controls;
    const birthDate = new Date(controls.birthDate.value.year, controls.birthDate.value.month, controls.birthDate.value.day);
    
    const request: StudentSignUpRequest = {
      login: controls.login.value,
      fullName: controls.fullName.value,
      email: controls.email.value,
      phone: controls.phone.value,
      password: controls.password.value,
      role: "STUDENT",
      beltLevel: controls.beltLevel.value,
      birthDate: birthDate.toISOString(),
      parentFullName: controls.parentFullName.value,
      parentPhone: controls.parentPhone.value
    };

    console.log(request);

    this.facadeService.register(request).subscribe({
      next: (response) => {
        this.showAlert("Успех", `Пользователь <b>${response.data.fullName}</b> зарегистрирован`, "positive", 3000);
        observer.complete();
        this.getStudents();
      },
      error: (response) => this.showAlert("Ошибка", response.error.message, "negative", 5000),
      complete: () => this.cdr.detectChanges()
    });
  }

  protected changeRoute(route: String) {
    this.router.navigate(['user/', route]);
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>, label: string, data?: Object): void {
    this.dialogs.open(content, { label, size: 'l' }).subscribe();
  }

  private showAlert(label: string, data: string, appearance: string, autoClose: number): void {
    this.alerts.open(data, { appearance, label, autoClose }).subscribe();
  }
}
