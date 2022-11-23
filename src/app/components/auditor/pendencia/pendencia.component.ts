import { Location } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NbGlobalPhysicalPosition,
  NbDialogService,
  NbToastrService,
} from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { MateriaPrimaList, MateriasPrimas } from 'src/app/models/materiaPrima';
import { Pendencias } from 'src/app/models/pendencia';
import { OpsService } from 'src/app/services/ops.service';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';
import { environment } from 'src/environments/environment';
import { DialogDefaultBodyComponent } from 'src/app/shared/components/dialog-default-body/dialog-default-body.component';
import { Pages } from 'src/app/models/enums/enumPages';
import { OP } from 'src/app/models/ops';

const usuarios_pendencias = environment.usuarios_pendencias;
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
  cd_user: number = 0;
  titulo = 'Pendências';

  opsData!: OP;
  cdLocal = '';
  codOp = '0';
  cicloOP = '0';
  nr_reduzido = '0';

  constructor(
    private cd: ChangeDetectorRef,
    private NbDdialogService: NbDialogService,
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

    this.cd_user = this._userService.getSession().CD_USUARIO!;
    let userNivel = this._userService.getNivel();

    this._userService.getUser().subscribe((user) => {
      this.loggedUser = user.nome!;
      if (Pages[userNivel] != 'auditor') {
        if (!usuarios_pendencias.includes(this.loggedUser)) {
          this._router.navigate(['login']);
        }
      }
    });

    this.codOp = this._route.snapshot.paramMap.get('cod')!;
    this.nr_reduzido = this.codOp.split('-')[0];
    this.cdLocal = this.codOp.split('-')[1];
  }

  ngAfterContentInit(): void {
    // se erro ao buscar dados no localstorage
    this._opService.getOpById(this.nr_reduzido, this.cdLocal).subscribe({
      next: (op) => {
        this.opsData = JSON.parse(op.data)[0];
        this.cicloOP = this.opsData.NR_CICLO + '-' + this.opsData.NR_OP;
      },
      error: (err) => {
        console.warn(err);
      },
    });

    this._pendenciaService.listMateriaPrima(this.codOp).subscribe({
      next: (x) => {
        let materialData = JSON.parse(x.data);
        try {
          materialData.map((_: { mp_list: any[] }) => {
            _.mp_list.forEach((y) => {
              y.DS_TAMANHO = y.DS_MATERIAL_SIZE?.toString().split(', ');
            });
          });

          materialData.filter(
            (_: {
              DS_PRODUCT_CLASSIFICATION: string;
              mp_list: { DS_TAMANHO: string[] }[];
            }) => {
              if (_.DS_PRODUCT_CLASSIFICATION == 'EMBALAGEM') {
                this.tamanhoList = _.mp_list[0].DS_TAMANHO!;
              }
            }
          );
          this.materiasPrimas = materialData.flatMap(
            (m: { mp_list: any }) => m.mp_list
          );

          this.materiasPrimasList = materialData;
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

    let descricaoCorte = (document.getElementById('corte') as HTMLInputElement)
      .value;
    descricaoCorte = descricaoCorte.replace(this.regSanitizer, '');
    this.obsValue = this.obsValue.replace(this.regSanitizer, '');

    // passar por todos os inputs e pegar valor
    this.materiasPrimas.forEach((materiaPrima) => {
      let cod =
        materiaPrima.CD_MATERIAL.toString() + '-' + materiaPrima.DS_MATERIAL;
      let inputSelecionado = document.getElementById(cod) as HTMLInputElement;
      let inputSelecionadoValor =
        parseInt(inputSelecionado.value) > this.opsData.QT_OP
          ? this.opsData.QT_OP
          : parseInt(inputSelecionado.value);

      if (!!inputSelecionadoValor) {
        this.inputList.push({
          id: cod,
          qnt: inputSelecionadoValor,
        });
      }
    });

    // se não teve nenhuma inserção de quantidade retorna erro
    if (!this.inputList.length) {
      this.toastrService.warning(
        'Preencha a quantidade solicitada!',
        'Atenção!!!',
        {
          preventDuplicates: true,
        }
      );
      this.loading.next(false);
      return;
    }

    // listar todos os códigos de matéria prima com valor inserido
    let codMPSelecionado = '';
    let tamanhoSelecionado = '';
    let qntSelecionado = 0;

    // criar objeto que será passado para o back
    this.materiasPrimasList.forEach((produto) => {
      let tmpClas = produto.DS_PRODUCT_CLASSIFICATION;
      let data_ajustada = new Date().toLocaleString('pt-Br').split(' ');
      let dt_modificacao =
        data_ajustada![0].split('/').reverse().join('-') +
        ' ' +
        data_ajustada![1];

      produto.mp_list.forEach((materiaPrima) => {
        let tmpCD_MP = materiaPrima.CD_MATERIAL.toString();
        let cod = tmpCD_MP + '-' + materiaPrima.DS_MATERIAL;
        codMPSelecionado = '';
        tamanhoSelecionado = '';
        qntSelecionado = 0;

        let tamanhoSelecionadoInput = (
          document.getElementById(tmpCD_MP + '_tamanho') as HTMLSelectElement
        ).children[0].children[0];
        if (tamanhoSelecionadoInput.innerHTML.substring(0, 5) != 'P/M/G') {
          tamanhoSelecionado = tamanhoSelecionadoInput.innerHTML.split(' ')[0];
        }

        // SE NÃO FOR SELECIONADO TAMANHO RETORNA ERRO
        if (tamanhoSelecionado == '') {
          return;
        }

        qntSelecionado = this.inputList.find((_) => _.id == cod)?.qnt || 0;
        codMPSelecionado = this.inputList.find((_) => _.id == cod)?.id || '';

        if (
          qntSelecionado > 0 &&
          tamanhoSelecionado != '' &&
          codMPSelecionado != ''
        ) {
          this.solicitacao.push({
            NR_REDUZIDOOP: this.opsData.NR_REDUZIDOOP,
            CD_LOCAL: parseInt(this.cdLocal),
            NR_CICLO: this.opsData.NR_CICLO,
            NR_OP: this.opsData.NR_OP,
            CD_REFERENCIA: parseInt(this.opsData.CD_REFERENCIA),
            DS_CLASSIFICACAO: tmpClas,
            CD_PRODUTO_MP: parseInt(tmpCD_MP),
            DS_PRODUTO_MP: materiaPrima.DS_MATERIAL,
            TAMANHO: tamanhoSelecionado,
            QT_SOLICITADO: qntSelecionado,
            CD_USUARIO: this.cd_user,
            USUARIO: this.loggedUser,
            DT_SOLICITACAO: dt_modificacao,
            CD_STATUS_PENDENCIA: 1,
            DS_STATUS_PENDENCIA: 'Em análise',
            OBS: this.obsValue,
            CORTE: descricaoCorte,
            QT_OP: this.opsData.QT_OP
          });
        }
      });
    });

    if (this.solicitacao.length > 0) {
      // abrir modal com o motivo da solicitação
      this.NbDdialogService.open(DialogDefaultBodyComponent, {
        context: {
          title: 'Motivo da Pendência',
          bodyText: '',
          buttonName: 'Enviar',
          solicitacao: this.solicitacao,
        },
      }).onClose.subscribe((x) => {
        if (x) {
          this.toastrService.success('Item enviado com sucesso!', 'Sucesso!', {
            preventDuplicates: true,
          });
          this.limparForm(true);
          return;
        }
        this.toastrService.warning(
          'Erro ao enviar solicitação!',
          'Atenção!!!',
          {
            preventDuplicates: true,
          }
        );
      });
    } else {
      this.toastrService.warning(
        'Alguns itens estão incorretos!',
        'Atenção!!!',
        {
          preventDuplicates: true,
        }
      );
    }
    this.loading.next(false);
  }

  limparForm(send?: boolean) {
    this.loading.next(true);
    this.obsValue = '';
    // passar por todos os inputs e pegar valor
    this.materiasPrimas.forEach((materiaPrima) => {
      let cod =
        materiaPrima.CD_MATERIAL.toString() + '-' + materiaPrima.DS_MATERIAL;
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
