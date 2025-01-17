import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, UrlMatchResult, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, select } from '@ngrx/store';

import { createCategoryView } from 'ish-core/models/category-view/category-view.model';
import { Category } from 'ish-core/models/category/category.model';
import { createProductView } from 'ish-core/models/product-view/product-view.model';
import { Product, VariationProduct } from 'ish-core/models/product/product.model';
import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { selectRouter } from 'ish-core/store/core/router';
import { categoryTree } from 'ish-core/utils/dev/test-data-utils';

import { generateProductUrl, matchProductRoute, ofProductUrl } from './product.route';

describe('Product Route', () => {
  const specials = { categoryPath: ['Specials'], uniqueId: 'Specials', name: 'Spezielles' } as Category;
  const topSeller = {
    categoryPath: ['Specials', 'Specials.TopSeller'],
    uniqueId: 'Specials.TopSeller',
    name: 'Angebote',
  } as Category;
  const limitedOffer = {
    categoryPath: ['Specials', 'Specials.TopSeller', 'Specials.TopSeller.LimitedOffer'],
    uniqueId: 'Specials.TopSeller.LimitedOffer',
    name: 'Black Friday',
  } as Category;

  expect.addSnapshotSerializer({
    test: val => val?.consumed && val.posParams,
    print: (val: UrlMatchResult, serialize) =>
      serialize(
        Object.keys(val.posParams)
          .map(key => ({ [key]: val.posParams[key].path }))
          .reduce((acc, v) => ({ ...acc, ...v }), {})
      ),
  });

  let wrap: (url: string) => UrlSegment[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RouterTestingModule] });
    const router = TestBed.inject(Router);
    wrap = url => {
      const primary = router.parseUrl(url).root.children.primary;
      return primary ? primary.segments : [];
    };
  });

  describe('without anything', () => {
    it('should be created', () => {
      expect(generateProductUrl(undefined, undefined)).toMatchInlineSnapshot(`"/"`);
      expect(generateProductUrl(undefined, undefined)).toMatchInlineSnapshot(`"/"`);
    });

    it('should not be a match for matcher', () => {
      expect(matchProductRoute(wrap(generateProductUrl(undefined, undefined)))).toMatchInlineSnapshot(`undefined`);
    });
  });

  describe('without category', () => {
    describe('without product name', () => {
      const product = createProductView({ sku: 'A' } as Product);
      it('should create simple link when just sku is supplied', () => {
        expect(generateProductUrl(product, undefined)).toMatchInlineSnapshot(`"/prdA"`);
      });

      it('should be a match for matcher', () => {
        expect(matchProductRoute(wrap(generateProductUrl(product, undefined)))).toMatchInlineSnapshot(`
          Object {
            "sku": "A",
          }
        `);
      });
    });

    describe('with product name', () => {
      const product = createProductView({ sku: 'A', name: 'some example name' } as Product);

      it('should include slug when product has a name', () => {
        expect(generateProductUrl(product, undefined)).toMatchInlineSnapshot(`"/some-example-name-prdA"`);
      });

      it('should include filtered slug when product has a name with special characters', () => {
        const product2 = { ...product, name: 'name & speci@l char$ - 1/2 price - (RETAIL)' };
        expect(generateProductUrl(product2, undefined)).toMatchInlineSnapshot(
          `"/name-speci@l-char$-1/2-price-retail-prdA"`
        );
      });

      it('should be a match for matcher', () => {
        expect(matchProductRoute(wrap(generateProductUrl(product, undefined)))).toMatchInlineSnapshot(`
          Object {
            "sku": "A",
          }
        `);
      });
    });

    describe('variation product', () => {
      const product = createProductView({
        sku: 'A',
        name: 'some example name',
        type: 'VariationProduct',
        variableVariationAttributes: [
          { value: 'SSD - (HDD)' },
          { value: 'Cobalt Blue & Yellow' },
          { value: '500 r/min' },
        ],
      } as VariationProduct);

      it('should include attribute values in slug when product is a variation', () => {
        expect(generateProductUrl(product, undefined)).toMatchInlineSnapshot(
          `"/some-example-name-ssd-hdd-cobalt-blue-yellow-500-r/min-prdA"`
        );
      });
    });
  });

  describe('with top level category', () => {
    const category = createCategoryView(categoryTree([specials]), specials.uniqueId);

    describe('as context', () => {
      describe('without product name', () => {
        const product = createProductView({ sku: 'A' } as Product, category);

        it('should be created', () => {
          expect(generateProductUrl(product, category)).toMatchInlineSnapshot(`"/spezielles/prdA-ctgSpecials"`);
        });

        it('should be a match for matcher', () => {
          expect(matchProductRoute(wrap(generateProductUrl(product, category)))).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "Specials",
              "sku": "A",
            }
          `);
        });
      });

      describe('with product name', () => {
        const product = createProductView({ sku: 'A', name: 'Das neue Surface Pro 7' } as Product, category);

        it('should be created', () => {
          expect(generateProductUrl(product, category)).toMatchInlineSnapshot(
            `"/spezielles/das-neue-surface-pro-7-prdA-ctgSpecials"`
          );
        });

        it('should be a match for matcher', () => {
          expect(matchProductRoute(wrap(generateProductUrl(product, category)))).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "Specials",
              "sku": "A",
            }
          `);
        });
      });
    });

    describe('as default category', () => {
      describe('without product name', () => {
        const product = createProductView({ sku: 'A' } as Product, category);

        it('should be created', () => {
          expect(generateProductUrl(product)).toMatchInlineSnapshot(`"/spezielles/prdA-ctgSpecials"`);
        });

        it('should be a match for matcher', () => {
          expect(matchProductRoute(wrap(generateProductUrl(product)))).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "Specials",
              "sku": "A",
            }
          `);
        });
      });

      describe('with product name', () => {
        const product = createProductView({ sku: 'A', name: 'Das neue Surface Pro 7' } as Product, category);

        it('should be created', () => {
          expect(generateProductUrl(product)).toMatchInlineSnapshot(
            `"/spezielles/das-neue-surface-pro-7-prdA-ctgSpecials"`
          );
        });

        it('should be a match for matcher', () => {
          expect(matchProductRoute(wrap(generateProductUrl(product)))).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "Specials",
              "sku": "A",
            }
          `);
        });
      });
    });
  });

  describe('with deep category', () => {
    const categories = categoryTree([specials, topSeller, limitedOffer]);
    const category = createCategoryView(categories, limitedOffer.uniqueId);

    describe('as context', () => {
      describe('without product name', () => {
        const product = createProductView({ sku: 'A' } as Product, category);

        it('should be created', () => {
          expect(generateProductUrl(product, category)).toMatchInlineSnapshot(
            `"/spezielles/angebote/black-friday/prdA-ctgSpecials.TopSeller.LimitedOffer"`
          );
        });

        it('should be a match for matcher', () => {
          expect(matchProductRoute(wrap(generateProductUrl(product, category)))).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "Specials.TopSeller.LimitedOffer",
              "sku": "A",
            }
          `);
        });
      });

      describe('with product name', () => {
        const product = createProductView({ sku: 'A', name: 'Das neue Surface Pro 7' } as Product, category);

        it('should be created', () => {
          expect(generateProductUrl(product, category)).toMatchInlineSnapshot(
            `"/spezielles/angebote/black-friday/das-neue-surface-pro-7-prdA-ctgSpecials.TopSeller.LimitedOffer"`
          );
        });

        it('should be a match for matcher', () => {
          expect(matchProductRoute(wrap(generateProductUrl(product, category)))).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "Specials.TopSeller.LimitedOffer",
              "sku": "A",
            }
          `);
        });
      });
    });

    describe('as default category', () => {
      describe('without product name', () => {
        const product = createProductView({ sku: 'A' } as Product, category);

        it('should be created', () => {
          expect(generateProductUrl(product)).toMatchInlineSnapshot(
            `"/spezielles/angebote/black-friday/prdA-ctgSpecials.TopSeller.LimitedOffer"`
          );
        });

        it('should be a match for matcher', () => {
          expect(matchProductRoute(wrap(generateProductUrl(product)))).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "Specials.TopSeller.LimitedOffer",
              "sku": "A",
            }
          `);
        });
      });

      describe('with product name', () => {
        const product = createProductView({ sku: 'A', name: 'Das neue Surface Pro 7' } as Product, category);

        it('should be created', () => {
          expect(generateProductUrl(product)).toMatchInlineSnapshot(
            `"/spezielles/angebote/black-friday/das-neue-surface-pro-7-prdA-ctgSpecials.TopSeller.LimitedOffer"`
          );
        });

        it('should be a match for matcher', () => {
          expect(matchProductRoute(wrap(generateProductUrl(product)))).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "Specials.TopSeller.LimitedOffer",
              "sku": "A",
            }
          `);
        });
      });
    });
  });

  describe('compatibility', () => {
    it.each(['/product/123', '/product/123/slug', '/category/123/product/123', '/category/123/product/123/slug'])(
      'should detect %p as route',
      url => {
        expect(matchProductRoute(wrap(url))).toHaveProperty('consumed');
      }
    );

    it('should not detect category route without product after it', () => {
      expect(matchProductRoute(wrap('/category/123'))).toBeUndefined();
    });
  });

  describe('additional URL params', () => {
    it('should ignore additional URL params when supplied', () => {
      const category = createCategoryView(categoryTree([specials, topSeller, limitedOffer]), limitedOffer.uniqueId);
      const product = createProductView({ sku: 'A', name: 'Das neue Surface Pro 7' } as Product);

      expect(matchProductRoute(wrap(`${generateProductUrl(product, category)};lang=de_DE`))).toMatchInlineSnapshot(`
        Object {
          "categoryUniqueId": "Specials.TopSeller.LimitedOffer",
          "sku": "A",
        }
      `);
    });
  });
});

describe('Product Route', () => {
  let router: Router;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreStoreModule.forTesting(['router']), RouterTestingModule.withRoutes([{ path: '**', children: [] }])],
    });

    router = TestBed.inject(Router);
    store = TestBed.inject(Store);
  });

  describe('ofProductRoute', () => {
    it('should detect product route when sku is a param', done => {
      router.navigateByUrl('/product;sku=123');

      store.pipe(ofProductUrl(), select(selectRouter)).subscribe(data => {
        expect(data.state.params).toMatchInlineSnapshot(`
            Object {
              "sku": "123",
            }
          `);
        done();
      });
    });

    it('should detect product route when sku and categoryUniqueId are params', done => {
      router.navigateByUrl('/product;sku=123;categoryUniqueId=ABC');

      store.pipe(ofProductUrl(), select(selectRouter)).subscribe(data => {
        expect(data.state.params).toMatchInlineSnapshot(`
            Object {
              "categoryUniqueId": "ABC",
              "sku": "123",
            }
          `);
        done();
      });
    });

    it('should not detect product route when sku is missing', fakeAsync(() => {
      router.navigateByUrl('/other');

      store.pipe(ofProductUrl()).subscribe({ next: fail, error: fail });

      tick(2000);
    }));
  });
});
