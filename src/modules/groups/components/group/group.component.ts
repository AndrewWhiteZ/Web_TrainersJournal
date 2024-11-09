import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { TuiComparator } from '@taiga-ui/addon-table';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiDay, tuiToInt } from '@taiga-ui/cdk';
import { TuiButton, TuiIcon, TuiScrollable, TuiScrollbar } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiBadgeNotification } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';
import { Subscription } from 'rxjs';

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
  ],
  templateUrl: './group.component.html',
  styleUrl: './group.component.less',
})
export class GroupComponent implements OnInit, OnDestroy {

  groupId: String | null = null;
  private routeSub: Subscription = new Subscription;

  constructor(private route: ActivatedRoute) {}
    
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.groupId = params['id'];
      console.log(params['id']) //log the value of id
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  protected readonly data = DATA;

  protected readonly columns = ['name', 'dob', 'age'];

  protected readonly getAge = getAge;

  protected readonly ageSorter: TuiComparator<User> = (a: User, b: User) =>
    getAge(a) - getAge(b);
}
