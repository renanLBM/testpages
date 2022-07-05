import { Component, OnInit, Input } from '@angular/core';
import {
  NbSortDirection,
  NbSortRequest,
  NbTreeGridDataSource,
  NbTreeGridDataSourceBuilder,
} from '@nebular/theme';

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface FSEntry {
  auditor: string;
  qnt_ops: string;
  percentual: string;
  regiao?: string;
}

@Component({
  selector: 'fc-alteracoes',
  templateUrl: './alteracoes.component.html',
  styleUrls: ['./alteracoes.component.scss'],
})
export class AlteracoesComponent implements OnInit {
  ngOnInit(): void {}

  customColumn = 'auditor';
  defaultColumns = ['qnt_ops', 'percentual', 'regiao'];
  allColumns = [this.customColumn, ...this.defaultColumns];

  dataSource: NbTreeGridDataSource<FSEntry>;

  sortColumn!: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>) {
    this.dataSource = this.dataSourceBuilder.create(this.data);
  }

  updateSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  private data: TreeNode<FSEntry>[] = [
    {
      data: {
        auditor: 'Andressa',
        qnt_ops: '1000',
        regiao: 'Criciúma',
        percentual: '40%',
      },
      children: [
        { data: { auditor: 'Teste', percentual: '10%',qnt_ops: '240' } },
        { data: { auditor: 'Teste', percentual: '10%', qnt_ops: '290' } },
        { data: { auditor: 'Teste', percentual: '10%', qnt_ops: '466' } },
        { data: { auditor: 'Teste', percentual: '10%', qnt_ops: '900' } },
      ],
    },
    {
      data: {
        auditor: 'Beta',
        percentual: '20%',
        qnt_ops: '400',
        regiao: 'Palhoça',
      },
      children: [
        { data: { auditor: 'Teste', percentual: '10%', qnt_ops: '100' } },
        { data: { auditor: 'Teste', percentual: '10%', qnt_ops: '300' } },
      ],
    },
    {
      data: {
        auditor: 'Paulo',
        percentual: '10%',
        qnt_ops: '109',
        regiao: 'Blumenal',
      },
      children: [
        { data: { auditor: 'Teste', percentual: '5%', qnt_ops: '107' } },
        { data: { auditor: 'Teste', percentual: '5%', qnt_ops: '2' } },
      ],
    },
  ];

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + nextColumnStep * index;
  }
}

@Component({
  selector: 'nb-fs-icon',
  template: `
    <nb-tree-grid-row-toggle [expanded]="expanded" *ngIf="isDir(); else child">
    </nb-tree-grid-row-toggle>
    <ng-template #child> </ng-template>
  `,
})
export class FsIconComponent {
  @Input() percentual!: string;
  @Input() expanded!: boolean;

  isDir(): boolean {
    return this.percentual === 'dir';
  }
}
