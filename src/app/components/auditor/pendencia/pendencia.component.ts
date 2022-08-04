import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Pendencias } from 'src/app/models/pendencia';
import { UserService } from 'src/app/services/user.service';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { ActivatedRoute } from '@angular/router';
import { MateriaPrimaList, MateriasPrimas } from 'src/app/models/materiaPrima';
import { BehaviorSubject, Observable } from 'rxjs';
import { OpsService } from 'src/app/services/ops.service';
import { OPs } from 'src/app/models/ops';

interface MPList {
  cod?: string;
  qnt?: number;
}

@Component({
  selector: 'fc-pendencia',
  templateUrl: './pendencia.component.html',
  styleUrls: ['./pendencia.component.scss'],
})
export class PendenciaComponent implements OnInit {
  positions = NbGlobalPhysicalPosition;

  loading = true;
  loadingError = false;
  isEmptyList = false;

  materiasPrimasList: MateriasPrimas = [];
  materiasPrimasList$: BehaviorSubject<MateriasPrimas> =
    new BehaviorSubject<MateriasPrimas>([]);

  solicitacao: Pendencias = [];
  inputList: MPList[] = [];
  materiasPrimas: MateriaPrimaList[] = [];

  loggedUser = '';
  cod_op = '0';
  ref = '';
  cicloOP = '';
  titulo = 'Pendências';
  qnt_op = 0;

  constructor(
    private _route: ActivatedRoute,
    private toastrService: NbToastrService,
    private _location: Location,
    private _userService: UserService,
    private _opService: OpsService,
    private _pendenciaService: PendenciasService
  ) {}

  ngOnInit(): void {
    this._userService.getUser().subscribe((user) => {
      this.loggedUser = user.nome;
    });

    this.cod_op = this._route.snapshot.paramMap.get('cod')!;
    this.ref = this.cod_op.split('-')[2];
    this.cicloOP = this.cod_op.split('-')[0] + '-' + this.cod_op.split('-')[1];
    let cd_local = this.cod_op.split('-')[3];

    this._opService
      .getOpById(cd_local, this.cicloOP + '-' + this.ref)
      .subscribe({
        next: (ops: OPs) => {
          this.titulo = ops[0].DS_GRUPO;
          this.qnt_op = ops[0].QT_OP;
        },
        error: (err) => console.log(err),
      });

    this._pendenciaService.listMateriaPrima(this.cod_op).subscribe({
      next: (x) => {
        this.materiasPrimas = x.flatMap((m) => m.mp_list);
        this.materiasPrimasList = x;
        this.materiasPrimasList$.next(this.materiasPrimasList);
        this.loading = false;
      },
    });
  }

  enviar() {
    this.loading = true;
    // pegar valor inserido em observações
    let obs = (document.getElementById('observacoes') as HTMLInputElement)
      .value;

    // passar por todos os inputs e pegar valor
    this.materiasPrimas.forEach((materiaPrima) => {
      let inputValue = parseInt(
        (
          document.getElementById(
            materiaPrima.CD_PRODUTO_MP.toString()
          ) as HTMLInputElement
        ).value
      );
      if (!!inputValue) {
        this.inputList.push({
          cod: materiaPrima.CD_PRODUTO_MP.toString(),
          qnt: inputValue,
        });
      }
    });

    if (!this.inputList.length) {
      this.loading = false;
      return;
    }

    // listar todos os códigos de matéria prima com valor inserido
    let codMPList = this.inputList.flatMap((mp) => mp.cod);

    // criar objeto que será passado para o back
    this.materiasPrimasList.forEach((produto) => {
      let tmpCiclo = produto.NR_CICLO;
      let tmpOP = produto.NR_OP;
      let tmpRef = produto.CD_REFERENCIA;
      let tmpClas = produto.DS_CLASSIFICACAO;

      produto.mp_list.forEach((materiaPrima) => {
        let tmpCD_MP = materiaPrima.CD_PRODUTO_MP.toString();
        let qnt_solicitado: number =
          this.inputList.find((_) => _.cod == tmpCD_MP)?.qnt || 0;
        if (codMPList.includes(tmpCD_MP)) {
          this.solicitacao.push({
            NR_CICLO: tmpCiclo,
            NR_OP: tmpOP,
            CD_REFERENCIA: tmpRef,
            DS_CLASSIFICACAO: tmpClas,
            CD_PRODUTO_MP: parseInt(tmpCD_MP),
            DS_PRODUTO_MP: materiaPrima.DS_PRODUTO_MP,
            QT_SOLICITADO: qnt_solicitado,
            USUARIO: this.loggedUser,
            DT_SOLICITACAO: new Date().toLocaleString('pt-Br'),
            STATUS: 'Em análise',
            Obs: obs,
          });
        }
      });
    });

    if (this.solicitacao.length > 0) {
      console.log(this.solicitacao);
      this._pendenciaService.setPendencia(this.solicitacao).subscribe({
        next: (res) => {
          this.toastrService.success(
            'Informações salvas!',
            'Salvo com sucesso!',
            {
              preventDuplicates: true,
            }
          );
          this.loading = false;
        },
        error: (err) => {
          console.log(err);
          this.toastrService.danger(
            'Erro ao enviar a solicitação!',
            'Erro!!!',
            {
              preventDuplicates: true,
            }
          );
          this.loading = false;
        },
      });
    }
    this.limparForm(true);
  }

  limparForm(send?: boolean) {
    this.loading = true;
    console.log(send);
    // passar por todos os inputs e pegar valor
    this.materiasPrimas.forEach((materiaPrima) => {
      (
        document.getElementById(
          materiaPrima.CD_PRODUTO_MP.toString()
        ) as HTMLInputElement
      ).value = '';
    });

    (document.getElementById('observacoes') as HTMLInputElement).value = '';

    if (!send) {
      this.toastrService.warning('Formulário limpo!', 'Atenção!', {
        preventDuplicates: true,
      });
    }
    this.inputList = [];
    this.solicitacao = [];
    setTimeout(() => (this.loading = false), 300);
  }

  voltar() {
    this._location.back();
  }
}
