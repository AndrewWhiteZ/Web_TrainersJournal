import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { TuiComparator } from '@taiga-ui/addon-table';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiDay, tuiToInt } from '@taiga-ui/cdk';
import { TuiAlertService, TuiAppearance, TuiAutoColorPipe, TuiButton, tuiDialog, TuiDialogContext, TuiDialogService, TuiError, TuiIcon, TuiInitialsPipe, TuiLabel, TuiScrollable, TuiScrollbar } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAvatar, TuiBadge, TuiBadgedContent, TuiBadgeNotification, TuiFieldErrorPipe, TuiItemsWithMore, TuiSkeleton, TuiStatus } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { map, Subscription } from 'rxjs';
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
import { ListSelectionComponent } from '../../../../app/shared/components/list-selection/list-selection.component';
import { FacadeService } from '../../../../app/shared/services/facade.service';

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
    TuiTable,
    TuiIcon,
    TuiAvatar,
    TuiHeader,
    TuiButton,
    TuiCardLarge,
    TuiAppearance,
    TuiItemsWithMore,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiSkeleton,
    TuiCell,
    TuiBadgedContent,
    TuiBlockStatus,
    TuiAutoColorPipe,
    TuiInitialsPipe
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupComponent implements OnInit, OnDestroy {

  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected skeletonGroup: boolean = true;
  protected skeletonStudents: boolean = true;
  
  protected group: GroupEntity | null = null;
  protected students: Array<StudentEntity> = new Array;
  private routeSub: Subscription = new Subscription;

  protected readonly addStudentForm = new FormGroup({
    studentValue: new FormControl('', { validators: [Validators.required], nonNullable: true } ),
  });

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private facadeService: FacadeService,
    private cdr: ChangeDetectorRef
  ) {}
    
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const groupId = params['id'];
      this.groupService.getGroupById(groupId).subscribe({
        next: (next) => {
          this.group = GroupMapper.mapToEntity(next.data);
          this.skeletonGroup = false;
          this.cdr.detectChanges();
          this.getStudents(groupId);
        } ,
        error: (error) => this.alerts.open(error, { appearance: 'negative', autoClose: 5000, label: 'Ошибка' }).subscribe(),
      });
    });
  }

  protected showDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content, { label: 'Добавить учащегося' }).subscribe();
  }

  private getStudents(groupId: string) {
    if (this.group === null) return;
    this.skeletonStudents = true;
    this.cdr.detectChanges();
    this.groupService.getGroupStudentsById(groupId).subscribe({
      next: (next) => {
        this.students = new Array;
        next.data.map((studentDto) => this.students.push(StudentMapper.mapToEntity(studentDto)));
      },
      error: (error) => {
        this.alerts.open(error.error.message, { appearance: 'negative', autoClose: 5000, label: 'Ошибка' }).subscribe();
      },
      complete: () => {
        this.skeletonStudents = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  private readonly dialog = tuiDialog(ListSelectionComponent<StudentDto>, {
    dismissible: true,
    label: 'Выберите учащегося',
    size: 'fullscreen'
  });

  protected showSelectionDialog(): void {
    const observe = this.facadeService.getStudents();
    this.dialog(observe).subscribe({
      next: (next) => {
        if (next === null || this.group === null) return;
        this.groupService.addStudent(this.group.id, next.id).subscribe({
          next: () => {
            if (this.group === null) return;
            this.alerts.open('Учащийся успешно добавлен в группу', { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
            this.getStudents(this.group.id);
          },
          error: (error) => {
            this.alerts.open(error.error.message, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe();
          },
        });
      }
    });
  }

  protected approveStudentRemoving(student: StudentEntity): void {
    this.dialogs.open<boolean>(
      TUI_CONFIRM,
      {
        label: 'Подтвердите действие',
        data: {
          content: `Вы действительно хотите исключить студента <b>${student.fullName}</b> из группы?`,
          yes: 'Да',
          no: 'Отмена'
        }
      }).subscribe({ next: (next) => { if (next) { this.removeStudent(student); }}}
    );
  }

  private removeStudent(student: StudentEntity) {
    if (this.group === null) return;
    this.groupService.removeStudent(this.group.id, student.id).subscribe({
      next: () => {
        if (this.group === null) return;
        this.alerts.open('Учащийся успешно исключен из группы', { autoClose: 3000, label: 'Успех', appearance: 'positive' }).subscribe();
        this.getStudents(this.group.id);
      },
      error: (error) => this.alerts.open(error, { autoClose: 5000, label: 'Ошибка', appearance: 'negative' }).subscribe(),
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
}
