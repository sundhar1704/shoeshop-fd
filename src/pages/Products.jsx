import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import api from "../services/api";
import ShopProductCard from "../components/ShopProductCard";
import "../styles/products.css";

const PAGE_SIZE = 12;
const PASS_KEYS = ["category", "style", "substyle", "brand", "color", "size", "q", "sort"];

const listAnim = {
  initial: { opacity: 0, scaleY: 0.85, y: -8 },
  animate: { opacity: 1, scaleY: 1, y: 0 },
  exit: { opacity: 0, scaleY: 0.85, y: -8 },
  transition: { duration: 0.2, ease: "easeOut" },
};

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(null);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [drop, setDrop] = useState(null); // "style" | "size" | "brand" | "color" | null
  const [sortOpen, setSortOpen] = useState(false);
  const barRef = useRef(null);

  const page = Number(params.get("page")) || 1;
  const viewAll = params.get("view") === "all";
  const sort = params.get("sort") || "featured";
  const totalPages = Math.ceil(count / PAGE_SIZE);

  useEffect(() => {
    api.get("/filters/").then(({ data }) => setFilters(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setDrop(null);
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const query = {};
    PASS_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) query[k] = v;
    });
    query.page = viewAll ? 1 : page;
    query.page_size = viewAll ? 100 : PAGE_SIZE;
    setLoading(true);
    api
      .get("/shop/products/", { params: query })
      .then(({ data }) => {
        setItems(data.results);
        setCount(data.count);
      })
      .catch(() => {
        setItems([]);
        setCount(0);
      })
      .finally(() => setLoading(false));
  }, [params]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || next.get(key) === String(value)) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    next.delete("view");
    setParams(next);
    setDrop(null);
    setSortOpen(false);
  };

  const goPage = (n) => {
    const next = new URLSearchParams(params);
    next.set("page", n);
    next.delete("view");
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showAll = () => {
    const next = new URLSearchParams(params);
    next.set("view", "all");
    next.delete("page");
    setParams(next);
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
    setDrop(null);
    setSortOpen(false);
  };

  const toggleDrop = (id) => {
    setSortOpen(false);
    setDrop(drop === id ? null : id);
  };

  const renderOption = (label, k, value) => (
    <button
      key={`${k}-${value}`}
      type="button"
      className={`shop-opt ${params.get(k) === String(value) ? "active" : ""}`}
      onClick={() => update(k, value)}
    >
      {label}
    </button>
  );

  const renderDrop = (id, label, content, extraClass = "") => (
    <div className="shop-drop" key={id}>
      <button type="button" className="shop-drop__btn" onClick={() => toggleDrop(id)}>
        <span>{label}</span>
        <motion.span
          className="shop-tri"
          animate={{ rotate: drop === id ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        />
      </button>
      <AnimatePresence>
        {drop === id && (
          <motion.div className={`shop-drop__list ${extraClass}`} {...listAnim}>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <section className="shop-page">
      <div className="shop-bar" ref={barRef}>
        <div className="shop-filters">
          <button type="button" className="shop-filters-toggle" onClick={toggleFilters}>
            Filters
            <motion.span
              className="shop-filters-arrow"
              animate={{ rotate: filtersOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <FiArrowRight />
            </motion.span>
          </button>

          <AnimatePresence>
            {filtersOpen && filters && (
              <motion.div
                className="shop-filters__row"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {renderDrop(
                  "style",
                  "Style",
                  filters.styles?.length > 0 ? (
                    filters.styles.map((s) => renderOption(s.name, "style", s.id))
                  ) : (
                    <p className="shop-empty">No styles yet</p>
                  )
                )}

                {renderDrop(
                  "size",
                  "Size",
                  filters.sizes.map((g) => (
                    <div key={g.group}>
                      <p className="shop-panel__group">{g.group}</p>
                      {g.labels.map((l) => renderOption(l, "size", l))}
                    </div>
                  ))
                )}

                {renderDrop(
                  "brand",
                  "Brands",
                  filters.brands.map((b) => renderOption(b.name, "brand", b.slug))
                )}

                {renderDrop(
                  "color",
                  "Color",
                  filters.colors.map((c, i) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      className={`shop-color ${params.get("color") === c.name ? "active" : ""}`}
                      onClick={() => update("color", c.name)}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span
                        className="shop-color__dot"
                        style={{ background: c.hex }}
                      />
                      <span className="shop-color__name">{c.name}</span>
                    </motion.button>
                  )),
                  "shop-drop__list--colors"
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="shop-sort">
          <button
            type="button"
            className="shop-sort__btn"
            onClick={() => {
              setDrop(null);
              setSortOpen(!sortOpen);
            }}
          >
            Sort by
          </button>
          <AnimatePresence>
            {sortOpen && filters && (
              <motion.div className="shop-sort__menu" {...listAnim}>
                {filters.sort_options.map((s, i) => (
                  <motion.button
                    key={s.key}
                    type="button"
                    className="shop-sort__item"
                    onClick={() => update("sort", s.key === "featured" ? "" : s.key)}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <span>{s.label}</span>
                    {sort === s.key && <FiCheck />}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {loading ? (
        <p className="shop-msg">Loading...</p>
      ) : items.length === 0 ? (
        <p className="shop-msg">No products found.</p>
      ) : (
        <div className="shop-grid">
          {items.map((p) => (
            <ShopProductCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {!loading && !viewAll && totalPages > 1 && (
        <div className="shop-pager">
          <button type="button" disabled={page <= 1} onClick={() => goPage(page - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>Next</button>
        </div>
      )}

      {!loading && !viewAll && count > PAGE_SIZE && (
        <div className="shop-viewall">
          <button type="button" onClick={showAll}>View all</button>
        </div>
      )}
    </section>
  );
}