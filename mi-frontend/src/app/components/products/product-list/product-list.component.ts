import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des produits. Veuillez réessayer.';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  filterProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = this.products;
      return;
    }
    
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(product => 
      product.title.toLowerCase().includes(search) || 
      product.description.toLowerCase().includes(search)
    );
  }

  getImageUrl(imagePath: string): string {
    // Si l'image est stockée localement sur le serveur Laravel
    return `http://localhost:8000/storage/${imagePath}`;
  }
}