import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { Order } from 'src/app/services/order';
import { User } from 'src/app/services/user';
import { GraphicService } from 'src/app/services/graphic.service';



//tslint:disable


@Component({
  selector: 'app-work-list',
  templateUrl: './work-list.component.html',
  styleUrls: ['./work-list.component.scss']
})
export class WorkListComponent implements OnInit {
  displayedColumns: string[] = ['nome'];
  idRappresentante: string;
  elementdata: any[] = []
  cols: string[];
  input: string;
  panelOpenState: boolean[] = [false];
  order: Order[] = []
  user: User;
  users: User[] = [];
  selectedIDR: string;





  constructor(private orderService: OrderService, private userService: UserService, private graphicService: GraphicService, private graphic: GraphicService) {

  }

  ngOnInit(): void {
    this.user = this.userService.getSubject().getValue();
    if (this.user.utente == 'rappresentante') {
      this.init$()
    }

    this.graphic.getAllUser().subscribe((data) => {
      Object.entries(data).forEach(([key,value])=>{
        if (value['utente'] !== 'grafico'){
          this.users.push(new User(value['name'], value['email'], value['mobile'], value['utente'], value['uId'], value['graficoEmail']))
        }
      })
    });


  }

  ngAfterViewInit(): void {

  }

  onSubmit() {
    if (this.selectedIDR !== null){
      this.elementdata = []
      this.order = []
      this.idRappresentante = this.selectedIDR;
      this.graphicService.setsubjectRappresentanteID(this.idRappresentante);
      this.init$()

    }

  }

  onTableSubmit(element) {

  }

  search() {
    this.reset()
    if (this.user.utente == 'grafico') {
      if (this.input != "") {
        this.orderService.getAllOrder$(this.idRappresentante).subscribe(
          (data) => {
            Object.entries(data).forEach(([key, value]) => {
              this.order.push(new Order(value['data'], value['id'], value['nome'], value['pezzi'], value['progetto']))
            }
            )
            this.elementdata = this.order.filter(res => { return res.nome.match(this.input) })
          })
      }
      else if (this.input == "") { this.init$() }
    }
    else {
      if (this.input != "") {
        this.orderService.getAllOrder$(this.user.uId).subscribe(
          (data) => {
            Object.entries(data).forEach(([key, value]) => {
              this.order.push(new Order(value['data'], value['id'], value['nome'], value['pezzi'], value['progetto']))
            }
            )
            this.elementdata = this.order.filter(res => { return res.nome.match(this.input) })
          })
      }
      else if (this.input == "") { this.init$() }
    }

  }

  init$() {
    if (this.user.utente == 'grafico') {
      this.orderService.getAllOrder$(this.idRappresentante).subscribe(
        (data) => {
          this.reset()
          Object.entries(data).forEach(([key, value]) => {
            this.order.push(new Order(value['data'], value['id'], value['nome'], value['pezzi'], value['progetto']))
          })
          this.elementdata = this.order
        }
      )
    }
    else {
      this.orderService.getAllOrder$(this.user.uId).subscribe(
        (data) => {
          this.reset()
          Object.entries(data).forEach(([key, value]) => {
            this.order.push(new Order(value['data'], value['id'], value['nome'], value['pezzi'], value['progetto']))
          })
          this.elementdata = this.order
        }
      )

    }

  }


  /**/

  removeItem(orderId: string, indexProject: number) {
    this.orderService.removeProject(orderId, indexProject).then(
      (data) => {
        this.init$()
      }
    ).catch(
      (error) => console.log(error)
    );

  }

  removeImg(keyImg: string) {

  }


  removeOrder(orderId: string) {
    const user = this.userService.getSubject().getValue();
    if (user.utente == 'grafico') {
      this.orderService.control(this.idRappresentante)
      this.userService.getListIdProjectFK(this.idRappresentante).then(snapshot => {

        snapshot.forEach(childSnapshot => {
          let childKey = childSnapshot.key;
          let childData = childSnapshot.val();
          if (childData == orderId) {
            this.orderService.removeOrder(childData, childKey, this.idRappresentante);
            this.userService.userListProject(user.uId).subscribe().unsubscribe();
            this.reset()
          }

        });



      });

    }

    else if (user.utente == 'rappresentante') {
      this.orderService.control(user.uId)
      this.userService.getListIdProjectFK(user.uId).then(snapshot => {
        snapshot.forEach(childSnapshot => {
          let childKey = childSnapshot.key;
          let childData = childSnapshot.val();
          if (childData == orderId) {
            this.orderService.removeOrder(childData, childKey, user.uId);
            this.userService.userListProject(user.uId).subscribe().unsubscribe();
            this.reset()
          }
        });
      });
    }
  }

  reset() {
    this.elementdata = []
    this.order = []
  }


}