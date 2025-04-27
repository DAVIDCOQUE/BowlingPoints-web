import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';

@Component({
  selector: 'app-clubes',
  templateUrl: './clubes.component.html',
  styleUrls: ['./clubes.component.css']
})

export class ClubesComponent implements OnInit {

  filtrosForm!: FormGroup;
  filter: string = '';
  clubes: any;

  constructor(private ResultadosService: ResultadosService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.get_clubes()
  }


  get_clubes() {
    this.ResultadosService.get_clubes().subscribe(clubes => {
      this.clubes = clubes;
      console.log(this.clubes);
    }
    )
  }
  clear() {

  }

  search() {

  }

}
