import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Apontamento, Apontamentos } from 'src/app/models/apontamento';
import { Coleta } from 'src/app/models/coleta';
import { descOP } from 'src/app/models/descOP';
import { ApontamentoList } from 'src/app/models/enums/enumApontamentos';
import { OP } from 'src/app/models/ops';
import { ApontamentoService } from 'src/app/services/apontamento.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MotoristaService } from 'src/app/services/motorista.service';
import { OpsService } from 'src/app/services/ops.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-descricao-faccao',
  templateUrl: './descricao-faccao.component.html',
  styleUrls: ['./descricao-faccao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescricaoFaccaoComponent implements OnInit {
  loading: boolean = false;
  loadingError: boolean = false;
  filtroAtivo: boolean = false;
  emptyList: boolean = false;
  defaultImage = '../../../../assets/not-found.png';
  imgUrl = 'https://indicium-lbm-client.s3-sa-east-1.amazonaws.com/images/';

  novoApontamento!: Apontamento;

  latitude: number = 0;
  longitude: number = 0;
  user: string = '';
  cd_user = 0;

  novaColeta!: Coleta;
  coletado: boolean = false;
  qntOPs: number = 0;
  qntPecas: number = 0;
  descOPLoad = new BehaviorSubject<boolean>(true);
  descOP: descOP[] = [];
  descOP$: BehaviorSubject<descOP[]> = new BehaviorSubject(this.descOP);

  constructor(
    private _route: ActivatedRoute,
    private _setTitle: SetTitleServiceService,
    private _aponamentoSerice: ApontamentoService,
    private _motoristaService: MotoristaService,
    private _userService: UserService,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');
    let id = this._route.snapshot.paramMap.get('id')!;
    this.user = this._userService.getSession().nome!;
    this.cd_user = this._userService.getSession().CD_USUARIO!;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitude = pos.coords.latitude;
          this.longitude = pos.coords.longitude;
        },
        (err) => console.error(`ERROR(${err.code}) ${err.message}`),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    this._motoristaService.listDisponivel().subscribe({
      next: (coletados) => {
        let listDisponivel = JSON.parse(coletados.data);
        listDisponivel = listDisponivel.filter(
          (x: { CD_LOCAL: number }) => x.CD_LOCAL == +id
        );

        listDisponivel.sort(
          (a: { DT_PREVRETORNO: string }, b: { DT_PREVRETORNO: string }) => {
            return a > b ? 1 : -1;
          }
        );

        let foiColetado: boolean = false;

        listDisponivel.map((op: OP) => {
          foiColetado = op.DS_APONTAMENTO_DS == 'Coletado';

          this.descOP.push({
            cod: op.NR_CICLO + '-' + op.NR_OP + '-' + op.CD_REFERENCIA,
            NR_REDUZIDOOP: op.NR_REDUZIDOOP!,
            cd_local: op.CD_LOCAL,
            local: op.DS_LOCAL,
            ciclo: +op.NR_CICLO,
            op: +op.NR_OP,
            ref: op.CD_REFERENCIA,
            previsao: new Date(+op.DT_PREVRETORNO)
              .toLocaleString('pt-Br')
              .substring(0, 10),
            Situacao: op.DS_APONTAMENTO_DS,
            checked: foiColetado,
            descricao: op.DS_GRUPO,
            drop: op.DS_DROP,
            img:
              this.imgUrl +
              op.CD_REFERENCIA.toString() +
              '/' +
              op.CD_REFERENCIA.toString() +
              '-1.jpg',
            link_ficha_tecnica: '',
            status: op.DS_APONTAMENTO_DS,
            status_color: op.DS_APONTAMENTO_DS!.toLowerCase().replace(' ', '-'),
            qnt: op.QT_OP,
          });
          this.descOP.map((desc) => {
            if (desc.status == 'Em andamento') {
              desc.accent = 'success';
            } else if (desc.status == 'Pendente') {
              desc.accent = 'warning';
            } else if (desc.status == 'Em atraso') {
              desc.accent = 'danger';
            } else {
              desc.accent = 'basic';
            }
          });
        });

        let title = this.descOP[0].local
          .replace('COSTURA', '')
          .replace('CONSERTO', '')
          .replace('ESTAMPARIA', '')
          .replace('TERCEIROS', '');
        this._setTitle.setTitle(title);

        this.qntOPs = this.descOP.length;
        let quantidades: number[] = this.descOP.flatMap((op) => op.qnt || 0);
        this.qntPecas = quantidades.reduce((prev, cur) => {
          return +prev + +cur;
        }, 0);

        this.descOP$.next(this.descOP);
        this.descOPLoad.next(!this.descOP.length);
      },
      error: (e) => {
        console.error(e);
        this._setTitle.setTitle('Erro');
        this.loadingError = true;
      },
    });
  }

  trackByOP(_index: number, op: { NR_REDUZIDOOP: number }) {
    return op.NR_REDUZIDOOP;
  }

  filtroOP(event: Event): void {
    document.getElementById('filtro')?.focus();
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroAtivo = false;
    if (filterValue == '') {
      this.descOP$.next(this.descOP);
    } else {
      this.filtroAtivo = true;
      this.descOP$.next(
        this.descOP.filter((_) => {
          return _.cod?.includes(filterValue.toUpperCase());
        })
      );
      this.descOP$.subscribe((x) => {
        this.emptyList = !x.length;
      });
    }
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.descOP$.next(this.descOP);
  }

  setColeta(op: descOP): void {
    this.loading = true;
    let data_ajustada = new Date().toLocaleString('pt-Br').split(' ');
    let dt_modificacao =
      data_ajustada![0].split('/').reverse().join('-') +
      ' ' +
      data_ajustada![1];

    this.novaColeta = {
      NR_REDUZIDOOP: op.NR_REDUZIDOOP!,
      CD_LOCAL: op.cd_local,
      DT_PREVRETORNO_HIST: op.previsao,
      QT_OP: op.qnt!,
      DS_STATUS_HIST: op.status!,
      CD_RESPONSAVEL: this.cd_user,
      USUARIO: this.user,
      DT_COLETA: dt_modificacao,
      GEOLOCALIZACAO: this.latitude + ', ' + this.longitude,
    };

    this._motoristaService.setColeta(this.novaColeta).subscribe({
      next: (ret) => {
        if (!ret) {
          this.coletado = false;
          return;
        }
        this.coletado = true;
        this.submitiApontamento(op);
        this.setCheckedColeta(op.NR_REDUZIDOOP!, this.coletado);
        this.loading = false;
      },
      error: (err) => {
        alert(`ERROR(${err.code}) ${err.message}`);
        this.coletado = false;
        this.loading = false;
      },
    });
  }

  setCheckedColeta(cod: number, coletado: boolean): void {
    this.descOP.map((op) => {
      if (op.NR_REDUZIDOOP == cod) {
        op.checked = coletado;
      }
      return op;
    });

    this.descOP$.next(this.descOP);
  }

  removeColeta(op: descOP): void {
    this.loading = true;
    let data_ajustada = new Date().toLocaleString('pt-Br').split(' ');
    let dt_modificacao =
      data_ajustada![0].split('/').reverse().join('-') +
      ' ' +
      data_ajustada![1];

    this.novaColeta = {
      NR_REDUZIDOOP: op.NR_REDUZIDOOP!,
      CD_LOCAL: op.cd_local,
      QT_OP: op.qnt!,
      DT_PREVRETORNO_HIST: op.previsao,
      DS_STATUS_HIST: op.status!,
      CD_RESPONSAVEL: this.cd_user,
      USUARIO: this.user,
      DT_COLETA: dt_modificacao,
      GEOLOCALIZACAO: this.latitude + ', ' + this.longitude,
    };

    this._motoristaService.removeColeta(this.novaColeta).subscribe({
      next: (ret) => {
        if (!ret) {
          return;
        }
        this.coletado = false;
        this.loading = false;
        this.setCheckedColeta(op.NR_REDUZIDOOP!, this.coletado);
      },
      error: (err) => {
        this.loading = false;
        alert(`ERROR(${err.code}) ${err.message}`);
      },
    });
  }

  submitiApontamento(op: descOP): void {
    let data_ajustada = new Date().toLocaleString('pt-Br').split(' ');
    let dt_modificacao =
      data_ajustada![0].split('/').reverse().join('-') +
      ' ' +
      data_ajustada![1];

    this.novoApontamento = {
      NR_REDUZIDOOP: op.NR_REDUZIDOOP,
      CD_LOCAL: op.cd_local,
      DT_PREVRETORNO: op.previsao,
      QT_OP: op.qnt!,
      Status: op.status!,
      CD_APONTAMENTO_DS:
        ApontamentoList['Coletado' as keyof typeof ApontamentoList] + 1,
      DS_APONTAMENTO_DS: 'Coletado',
      CD_USUARIO: this.cd_user,
      USUARIO: this.user,
      DT_MODIFICACAO: dt_modificacao,
      GEOLOCALIZACAO: this.latitude + ', ' + this.longitude,
    };

    this.loading = true;
    this._aponamentoSerice.setApontamento(this.novoApontamento).subscribe({
      next: (ret) => {
        this.loading = false;
        return;
      },
      error: (err) => {
        alert(`ERROR(${err.code}) ${err.message}`);
      },
    });
    this.loading = false;
  }
}
