import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { TuiComparator } from '@taiga-ui/addon-table';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiDay, tuiToInt } from '@taiga-ui/cdk';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, TuiDialogContext, TuiDialogService, TuiError, TuiIcon, TuiInitialsPipe, TuiScrollable, TuiScrollbar } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiBadgeNotification, TuiFieldErrorPipe, TuiItemsWithMore, TuiStatus } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Subscription } from 'rxjs';
import { GroupEntity } from '../../../../app/shared/models/entity/group.entity';
import { GroupService } from '../../services/group.service';
import { GroupMapper } from '../../../../app/shared/models/mapper/group.mapper';
import { StudentDto } from '../../../../app/shared/models/dto/student.dto';
import { StudentMapper } from '../../../../app/shared/models/mapper/student.mapper';
import { StudentEntity } from '../../../../app/shared/models/entity/student.entity';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { StudentService } from '../../../users/services/student.service';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

interface User {
  readonly dob: TuiDay;
  readonly name: string;
}

const TODAY = TuiDay.currentLocal();
const FIRST = [
  'John',
  'Jane',
  'Jack',
  'Jill',
  'James',
  'Joan',
  'Jim',
  'Julia',
  'Joe',
  'Julia',
];

const LAST = [
  'Smith',
  'West',
  'Brown',
  'Jones',
  'Davis',
  'Miller',
  'Johnson',
  'Jackson',
  'Williams',
  'Wilson',
];

const DATA: readonly User[] = Array.from({ length: 300 }, () => ({
  name: `${LAST[Math.floor(Math.random() * 10)]}, ${
    FIRST[Math.floor(Math.random() * 10)]
  }`,
  dob: TODAY.append({ day: -Math.floor(Math.random() * 4000) - 7500 }),
}));

function getAge({ dob }: User): number {
  const years = TODAY.year - dob.year;
  const months = TODAY.month - dob.month;
  const days = TODAY.day - dob.day;
  const offset = tuiToInt(months > 0 || (!months && days > 9));

  return years + offset;
}

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    TuiScrollable,
    TuiScrollbar,
    TuiTable,
    TuiIcon,
    TuiBadge,
    TuiBadgeNotification,
    TuiAvatar,
    TuiHeader,
    TuiButton,
    TuiCardLarge,
    TuiAppearance,
    TuiStatus,
    TuiItemsWithMore,
    TuiInitialsPipe,
    TuiAutoColorPipe,
    ReactiveFormsModule,
    TuiError,
    AsyncPipe,
    TuiFieldErrorPipe,
    TuiInputModule,
    TuiTextfieldControllerModule,
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.less',
})
export class GroupComponent implements OnInit, OnDestroy {

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected group: GroupEntity | null = null;
  protected students: Array<StudentEntity> = new Array;
  private routeSub: Subscription = new Subscription;

  protected readonly addStudentForm = new FormGroup({
    studentValue: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
  });

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
  ) {}
    
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.groupService.getGroupById(groupId).subscribe({
        next: (next) => this.group = GroupMapper.mapToEntity(next.data),
        error: (error) => this.alerts.open(error, { appearance: 'negative', autoClose: 5000, label: 'Ошибка' }).subscribe(),
      });
      this.groupService.getGroupStudentsById(groupId).subscribe({
        next: (next) => next.data.map((studentDto) => this.students.push(StudentMapper.mapToEntity(studentDto))),
        error: (error) => this.alerts.open(error, { appearance: 'negative', autoClose: 5000, label: 'Ошибка' }).subscribe(),
      });
    });
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, { label: 'Добавить учащегося' }).subscribe();
  }

  addStudent(observer: any) {
    if (!this.group) return;
    this.groupService.addStudent(this.group?.id, this.addStudentForm.controls.studentValue.value).subscribe({
      next: (next) => {
        this.alerts.open(next, { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
        observer.complete();
      },
      error: (error) => this.alerts.open(error, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe(),
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
}
