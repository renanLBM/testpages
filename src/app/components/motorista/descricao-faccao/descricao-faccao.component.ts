import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Apontamento, Apontamentos } from 'src/app/models/apontamento';
import { Coleta } from 'src/app/models/coleta';
import { descOP } from 'src/app/models/descOP';
import { OP, OPs } from 'src/app/models/ops';
import { AuditorService } from 'src/app/services/auditor.service';
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

  apontamentoList!: Apontamentos;
  apontamento!: Apontamento;
  novoApontamento!: Apontamento;

  latitude: number = 0;
  longitude: number = 0;
  user: string = '';

  novaColeta!: Coleta;
  coletado: boolean = false;
  qntOPs: number = 0;
  qntPecas: number = 0;
  listCodOPsDisponiveis: string[] = [];
  descOP: descOP[] = [];
  descOP$: BehaviorSubject<descOP[]> = new BehaviorSubject(this.descOP);

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _auditorService: AuditorService,
    private _motoristaService: MotoristaService,
    private _userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
    private _route: ActivatedRoute,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');
    let id = this._route.snapshot.paramMap.get('id')!;
    this.user = this._userService.getSession().nome;

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

    this._auditorService.getApontamento().subscribe((apontamentos) => {
      let apontamentosDisponiveis = apontamentos.filter(
        (apontamento) =>
          apontamento.Situacao == 'Disponível para coleta' ||
          apontamento.Situacao == 'Em transporte'
      );
      this.listCodOPsDisponiveis = apontamentosDisponiveis.flatMap(
        (op) => op.cod + '-' + op.CD_LOCAL
      );
      this._motoristaService.getColeta().subscribe({
        next: (coletados) => {
          this._opsService.getOpById(id).subscribe({
            next: (ops: OPs) => {
              ops = ops.filter((op: OP) =>
                this.listCodOPsDisponiveis.includes(op.cod + '-' + op.CD_LOCAL)
              );
              ops.sort((a, b) => {
                let dataRetornoA = `${a.PREV_RETORNO.substring(
                  6,
                  10
                )}-${a.PREV_RETORNO.substring(3, 5)}-${a.PREV_RETORNO.substring(
                  0,
                  2
                )}`;
                let dataRetornoB = `${b.PREV_RETORNO.substring(
                  6,
                  10
                )}-${b.PREV_RETORNO.substring(3, 5)}-${b.PREV_RETORNO.substring(
                  0,
                  2
                )}`;

                let x = new Date(dataRetornoA);
                let y = new Date(dataRetornoB);

                if (x > y) {
                  return 1;
                } else if (y > x) {
                  return -1;
                } else {
                  return 0;
                }
              });

              let maiorApontamento;
              let foiColetado: boolean = false;

              ops.map((op) => {
                foiColetado = !!coletados.filter(
                  (coleta) => coleta.CD_REFERENCIA == op.CD_REFERENCIA
                )[0];
                maiorApontamento = this.filtraMaiorApontamento(
                  op.CD_REFERENCIA
                );

                this.descOP.push({
                  cd_local: op.CD_LOCAL,
                  local: op.DS_LOCAL,
                  cod:
                    op.NR_CICLO.toString() +
                    '-' +
                    op.NR_OP.toString() +
                    '-' +
                    op.CD_REFERENCIA.toString(),
                  ciclo: op.NR_CICLO,
                  op: op.NR_OP,
                  ref: op.CD_REFERENCIA,
                  previsao: op.PREV_RETORNO.substring(0, 10),
                  Situacao: maiorApontamento.situacao,
                  checked: foiColetado,
                  descricao: op.DS_GRUPO,
                  drop: op.DS_DROP,
                  img:
                    this.imgUrl +
                    op.CD_REFERENCIA.toString() +
                    '/' +
                    op.CD_REFERENCIA.toString() +
                    '-1.jpg',
                  status: op.Status,
                  status_color: op.Status.toLowerCase().replace(' ', '-'),
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
              let quantidades: number[] = this.descOP.flatMap(
                (op) => op.qnt || 0
              );
              this.qntPecas = quantidades.reduce((prev, cur) => {
                return +prev + +cur;
              }, 0);

              this.descOP$.next(this.descOP);
            },
            error: (e) => {
              console.error(e);
              this._setTitle.setTitle('Erro');
              this.loadingError = true;
            },
          });
        },
        error: (e) => {
          console.error(e);
          this._setTitle.setTitle('Erro');
          this.loadingError = true;
        },
      });
    });
  }

  trackByOP(_index: number, op: { cod: string }) {
    return op.cod;
  }

  filtraMaiorApontamento(ref: number) {
    if (this.apontamentoList) {
      let erro = this.apontamentoList.toString() == 'error';
      if (!erro) {
        let apontamentos = this.apontamentoList.filter(
          (m) => m.CD_REFERENCIA == ref
        );
        if (apontamentos.length > 0) {
          this.apontamento = apontamentos.reduce((p, c) => {
            return p.ID_NOVA_SITUACAO! > c.ID_NOVA_SITUACAO! ? p : c;
          });
          return {
            situacao: this.apontamento.Situacao,
            dt_coleta: '',
          };
        }
        return { ds_atraso: '', dt_atraso: '', i_checked: false };
      }
    }
    return { ds_atraso: '', dt_atraso: '', i_checked: false };
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
        this.descOP.filter((_) => _.cod.includes(filterValue.toUpperCase()))
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

  sendColetaBt(op: descOP): void {
    this.novaColeta = {
      cod: '',
      CD_LOCAL: op.cd_local,
      NR_CICLO: op.ciclo!,
      NR_OP: op.op!,
      CD_REFERENCIA: op.ref,
      PREV_RETORNO: op.previsao,
      QT_OP: op.qnt!,
      Status: op.status!,
      USUARIO: this.user,
      DT_COLETA: new Date().toLocaleString('pt-Br'),
      latitude: this.latitude,
      longitude: this.longitude,
    };

    this._motoristaService.setColeta(this.novaColeta).subscribe({
      next: (ret) => {
        if (!ret) {
          this.coletado = false;
          return;
        }
        this.coletado = true;
        this.submitiApontamento(op);
        this.setCheckedColeta(op.ref, this.coletado);
      },
      error: (err) => {
        alert(`ERROR(${err.code}) ${err.message}`);
        this.coletado = false;
      },
    });

    this.loading = false;
    this.changeDetectorRef.detectChanges();
  }

  setCheckedColeta(ref: number, coletado: boolean): void {
    this.descOP.map((op) => {
      if (+op.ref == ref) {
        op.checked = coletado;
      }
      return op;
    });
    this.changeDetectorRef.detectChanges();
  }

  removeColetaBt(op: descOP): void {
    this.loading = true;

    this.novaColeta = {
      cod: '',
      CD_LOCAL: op.cd_local,
      NR_CICLO: op.ciclo!,
      NR_OP: op.op!,
      CD_REFERENCIA: op.ref,
      PREV_RETORNO: op.previsao,
      QT_OP: op.qnt!,
      Status: op.status!,
      USUARIO: this.user,
      DT_COLETA: new Date().toLocaleString('pt-Br'),
      latitude: this.latitude,
      longitude: this.longitude,
    };

    this._motoristaService.removeColeta(this.novaColeta).subscribe({
      next: (ret) => {
        if (!ret) {
          return;
        }
        this.coletado = false;
        this.setCheckedColeta(op.ref, this.coletado);
      },
      error: (err) => {
        alert(`ERROR(${err.code}) ${err.message}`);
      },
    });
  }

  submitiApontamento(op: descOP): void {
    this.novoApontamento = {
      cod: '',
      CD_LOCAL: op.cd_local,
      NR_CICLO: op.ciclo!,
      NR_OP: op.op!,
      CD_REFERENCIA: op.ref,
      PREV_RETORNO: op.previsao,
      QT_OP: op.qnt!,
      Status: op.status!,
      Situacao: 'Em transporte',
      USUARIO: this.user,
      DT_INSERIDO: new Date().toLocaleString('pt-Br'),
      latitude: this.latitude,
      longitude: this.longitude,
    };

    this.loading = true;
    this._auditorService.setApontamento(this.novoApontamento).subscribe({
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
