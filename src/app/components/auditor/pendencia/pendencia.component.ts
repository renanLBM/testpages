import { Location } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { MateriaPrimaList, MateriasPrimas } from 'src/app/models/materiaPrima';
import { Pendencias } from 'src/app/models/pendencia';
import { OpsService } from 'src/app/services/ops.service';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';
import { environment } from 'src/environments/environment';


const usuarios_pendencias = environment.usuarios_pendencias
interface MPList {
  id?: string;
  qnt?: number;
}

@Component({
  selector: 'fc-pendencia',
  templateUrl: './pendencia.component.html',
  styleUrls: ['./pendencia.component.scss'],
})
export class PendenciaComponent implements OnInit, AfterContentInit {
  positions = NbGlobalPhysicalPosition;
  regSanitizer = /<(?:[^>=]|='[^']*'|=\"[^\"]*\"|=[^'\"][^\\s>]*)*>|(%3c)|%3e/g;

  loading = new BehaviorSubject<boolean>(true);
  loadingError = false;
  naoEncontrado = new BehaviorSubject<boolean>(false);

  materiasPrimasList: MateriasPrimas = [];
  materiasPrimasList$: BehaviorSubject<MateriasPrimas> =
    new BehaviorSubject<MateriasPrimas>([]);

  obsValue = '';
  tamanhoList: string[] = [];
  solicitacao: Pendencias = [];
  inputList: MPList[] = [];
  materiasPrimas: MateriaPrimaList[] = [];

  loggedUser: string = '';
  titulo = 'Pendências';

  cdLocal = '';
  codOp = '0';
  cicloOP = '';
  ref = '';
  qntOp = 0;

  constructor(
    private cd: ChangeDetectorRef,
    private toastrService: NbToastrService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _setTitulo: SetTitleServiceService,
    private _userService: UserService,
    private _opService: OpsService,
    private _pendenciaService: PendenciasService
  ) {}

  ngOnInit(): void {
    this._setTitulo.setTitle('Nova Solicitação');

    this._userService.getUser().subscribe((user) => {
      this.loggedUser = user.nome!;

      if(!usuarios_pendencias.includes(this.loggedUser)){
        this._router.navigate(['login']);
      }
    });

    this.codOp = this._route.snapshot.paramMap.get('cod')!;
    this.ref = this.codOp.split('-')[2];
    this.cicloOP = this.codOp.split('-')[0] + '-' + this.codOp.split('-')[1];
    this.cdLocal = this.codOp.split('-')[3];
  }

  ngAfterContentInit(): void {
    let opsData = this._opService
      .getSessionData()
      .filter((_) => _.cod == this.cicloOP + '-' + this.ref)[0];

    // se erro ao buscar dados no localstorage
    if (!opsData) {
      this._opService
        .getOpById(this.cdLocal, this.cicloOP + '-' + this.ref)
        .subscribe({
          next: (op) => {
            opsData = op[0];
            this.titulo = opsData.DS_GRUPO;
            this.qntOp = opsData.QT_OP;
          },
          error: (err) => {
            console.warn(err);
          },
        });
    } else {
      this.titulo = opsData.DS_GRUPO;
      this.qntOp = opsData.QT_OP;
    }

    this._pendenciaService.listMateriaPrima(this.codOp).subscribe({
      next: (x) => {
        try {
          x.map((_) => {
            _.mp_list.forEach((y) => {
              y.DS_TAMANHO = y.DS_TAMANHO?.toString().split(', ');
            });
          });
          x.filter((_) => {
            if (_.DS_CLASSIFICACAO == 'EMBALAGEM') {
              this.tamanhoList = _.mp_list[0].DS_TAMANHO!;
            }
          });
          this.materiasPrimas = x.flatMap((m) => m.mp_list);

          this.materiasPrimasList = x;
          this.materiasPrimasList$.next(this.materiasPrimasList);
          this.loading.next(false);
          this.cd.detectChanges();
        } catch {
          this.naoEncontrado.next(true);
          throw 'Peça não encontrada';
        }
      },
    });
  }

  enviar() {
    this.loading.next(true);

    this.obsValue = this.obsValue.replace(this.regSanitizer, '');

    // passar por todos os inputs e pegar valor
    this.materiasPrimas.forEach((materiaPrima) => {
      let cod =
        materiaPrima.CD_PRODUTO_MP.toString() +
        '-' +
        materiaPrima.DS_PRODUTO_MP;
      let inputSelecionado = document.getElementById(cod) as HTMLInputElement;
      let inputSelecionadoValor =
        parseInt(inputSelecionado.value) > this.qntOp
          ? this.qntOp
          : parseInt(inputSelecionado.value);

      if (!!inputSelecionadoValor && cod != '1-corte') {
        this.inputList.push({
          id: cod,
          qnt: inputSelecionadoValor,
        });
      }
    });

    let quantidadeCorte = document.getElementById(
      '1-corte'
    ) as HTMLInputElement;

    // se não teve nenhuma inserção de quantidade retorna erro
    if (!this.inputList.length && !parseInt(quantidadeCorte.value)) {
      this.toastrService.warning(
        'Nenhum campo de matéria prima preenchido!',
        'Atenção!!!',
        {
          preventDuplicates: true,
        }
      );
      this.loading.next(false);
      return;
    }

    // listar todos os códigos de matéria prima com valor inserido
    let codMPList = this.inputList.flatMap((mp) => mp.id);

    // criar objeto que será passado para o back
    this.materiasPrimasList.forEach((produto) => {
      let tmpClas = produto.DS_CLASSIFICACAO;

      produto.mp_list.forEach((materiaPrima) => {
        let tmpCD_MP = materiaPrima.CD_PRODUTO_MP.toString();
        let cod = tmpCD_MP + '-' + materiaPrima.DS_PRODUTO_MP;

        let tamanhoSelecionadoInput = (
          document.getElementById(tmpCD_MP + '_tamanho') as HTMLSelectElement
        ).children[0].children[0];
        let tamanhoSelecionado = '';
        if (tamanhoSelecionadoInput.innerHTML.substring(0, 5) != 'P/M/G') {
          tamanhoSelecionado = tamanhoSelecionadoInput.innerHTML.substring(
            0,
            2
          );
        }

        let qntSelecionado: number =
          this.inputList.find((_) => _.id == cod)?.qnt || 0;

        if (codMPList.includes(cod)) {
          this.solicitacao.push({
            CD_LOCAL: parseInt(this.cdLocal),
            NR_CICLO: parseInt(this.codOp.split('-')[0]),
            NR_OP: parseInt(this.codOp.split('-')[1]),
            CD_REFERENCIA: parseInt(this.ref),
            DS_CLASSIFICACAO: tmpClas,
            CD_PRODUTO_MP: parseInt(tmpCD_MP),
            DS_PRODUTO_MP: materiaPrima.DS_PRODUTO_MP,
            TAMANHO: tamanhoSelecionado,
            QT_SOLICITADO: qntSelecionado,
            USUARIO: this.loggedUser,
            DT_SOLICITACAO: new Date().toLocaleString('pt-Br'),
            STATUS: 'Em análise',
            Obs: this.obsValue,
          });
        }
      });
    });

    // corte
    let descricaoCorte = (document.getElementById('corte') as HTMLInputElement)
      .value;
    descricaoCorte = descricaoCorte.replace(this.regSanitizer, '');
    let corteInput = document.getElementById('1_tamanho') as HTMLSelectElement;
    let tamanhoCorte = '';
    if (corteInput.innerHTML.substring(0, 5) != 'P/M/G') {
      tamanhoCorte =
        corteInput.children[0].children[0].innerHTML.split('<!--')[0];
    }

    tamanhoCorte = !!parseInt(tamanhoCorte)
      ? tamanhoCorte.substring(0, -1)
      : tamanhoCorte;

    let quantidadeCorteValor = parseInt(quantidadeCorte.value);

    if (!!quantidadeCorteValor) {
      if (!descricaoCorte && !tamanhoCorte) {
        this.toastrService.warning(
          'Preencha todos os campos do CORTE para enviar!',
          'Atenção!!!',
          {
            preventDuplicates: true,
          }
        );
        this.loading.next(false);
        return;
      } else {
        // necessário pois pode ter somente solicitação de aviamento
        this.solicitacao.push({
          CD_LOCAL: parseInt(this.cdLocal),
          NR_CICLO: parseInt(this.codOp.split('-')[0]),
          NR_OP: parseInt(this.codOp.split('-')[1]),
          CD_REFERENCIA: parseInt(this.ref),
          DS_CLASSIFICACAO: 'CORTE',
          CD_PRODUTO_MP: 1,
          DS_PRODUTO_MP: descricaoCorte,
          TAMANHO: tamanhoCorte,
          QT_SOLICITADO: quantidadeCorteValor,
          USUARIO: this.loggedUser,
          DT_SOLICITACAO: new Date().toLocaleString('pt-Br'),
          STATUS: 'Em análise',
          Obs: this.obsValue,
        });
      }
    }

    if (this.solicitacao.length > 0) {
      this._pendenciaService.setPendencia(this.solicitacao).subscribe({
        next: (res) => {
          this.toastrService.success(
            'Informações salvas!',
            'Salvo com sucesso!',
            {
              preventDuplicates: true,
            }
          );
          this.loading.next(false);
        },
        error: (err) => {
          console.warn(err);
          this.toastrService.danger(
            'Erro ao enviar a solicitação!',
            'Erro!!!',
            {
              preventDuplicates: true,
            }
          );
          this.loading.next(false);
        },
      });
    }
    this.limparForm(true);
  }

  limparForm(send?: boolean) {
    this.loading.next(true);
    this.obsValue = '';
    // passar por todos os inputs e pegar valor
    this.materiasPrimas.forEach((materiaPrima) => {
      let cod =
        materiaPrima.CD_PRODUTO_MP.toString() +
        '-' +
        materiaPrima.DS_PRODUTO_MP;
      (document.getElementById(cod) as HTMLInputElement).value = '';
    });

    (document.getElementById('corte') as HTMLInputElement).value = '';
    (document.getElementById('observacoes') as HTMLInputElement).value = '';

    if (!send) {
      this.toastrService.warning('Formulário limpo!', 'Atenção!', {
        preventDuplicates: true,
      });
    }
    this.inputList = [];
    this.solicitacao = [];

    setTimeout(() => this.loading.next(false), 300);
    this.cd.detectChanges();
  }

  voltar() {
    this._location.back();
  }
}
