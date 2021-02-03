import { h, ref, defineComponent, inject } from 'vue'
import { NCheckbox } from '../../../checkbox'
import { NScrollbar, ScrollbarRef } from '../../../scrollbar'
import { formatLength } from '../../../_utils'
import { DataTableInjection, MainTableInjection, TmNode } from '../interface'
import { createCustomWidthStyle, createRowClassName } from '../utils'
import Cell from './Cell'

export default defineComponent({
  name: 'DataTableBody',
  setup () {
    const NDataTable = inject<DataTableInjection>(
      'NDataTable'
    ) as DataTableInjection
    const NMainTable = inject<MainTableInjection>(
      'NMainTable'
    ) as MainTableInjection
    const scrollbarInstRef = ref<ScrollbarRef | null>(null)
    function handleCheckboxUpdateChecked (
      tmNode: TmNode,
      checked: boolean
    ): void {
      NDataTable.doUpdateCheckedRowKeys(
        checked
          ? NDataTable.treeMate.check(
            tmNode.key,
            NDataTable.mergedCheckedRowKeys
          ).checkedKeys
          : NDataTable.treeMate.uncheck(
            tmNode.key,
            NDataTable.mergedCheckedRowKeys
          ).checkedKeys
      )
    }
    function getScrollContainer (): HTMLElement | null {
      const { value } = scrollbarInstRef
      if (value) return value.containerRef
      return null
    }
    function handleScroll (event: Event): void {
      NDataTable.handleTableBodyScroll(event)
    }
    return {
      NDataTable,
      NMainTable,
      scrollbarInstRef,
      getScrollContainer,
      handleScroll,
      handleCheckboxUpdateChecked
    }
  },
  render () {
    const { NDataTable, NMainTable, handleScroll } = this
    const { mergedTheme, scrollX } = NDataTable
    return (
      <NScrollbar
        ref="scrollbarInstRef"
        class="n-data-table-base-table-body"
        theme={mergedTheme.peers.Scrollbar}
        themeOverrides={mergedTheme.peerOverrides.Scrollbar}
        contentStyle={{
          minWidth: formatLength(scrollX)
        }}
        horizontalRailStyle={{ zIndex: 3 }}
        verticalRailStyle={{ zIndex: 3 }}
        xScrollable
        onScroll={handleScroll}
      >
        {{
          default: () => (
            <table ref="body" class="n-data-table-table">
              <colgroup>
                {NDataTable.columns.map((column, index) => (
                  <col
                    key={column.key}
                    style={createCustomWidthStyle(column, index)}
                  ></col>
                ))}
              </colgroup>
              <tbody ref="tbody" class="n-data-table-tbody">
                {NDataTable.paginatedData.map((tmNode, index) => {
                  const { rawNode: row } = tmNode
                  const { handleCheckboxUpdateChecked } = this
                  const {
                    columns,
                    fixedColumnLeftMap,
                    fixedColumnRightMap,
                    currentPage,
                    mergedCheckedRowKeys,
                    rowClassName
                  } = NDataTable
                  const {
                    leftActiveFixedColKey,
                    rightActiveFixedColKey
                  } = NMainTable
                  return (
                    <tr
                      key={tmNode.key}
                      class={[
                        'n-data-table-tr',
                        createRowClassName(row, index, rowClassName)
                      ]}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          style={{
                            textAlign: column.align || undefined,
                            left: fixedColumnLeftMap[column.key],
                            right: fixedColumnRightMap[column.key]
                          }}
                          class={[
                            'n-data-table-td',
                            column.className,
                            column.fixed &&
                              `n-data-table-td--fixed-${column.fixed}`,
                            column.align &&
                              `n-data-table-td--${column.align}-align`,
                            {
                              'n-data-table-td--ellipsis': column.ellipsis,
                              'n-data-table-td--shadow-after':
                                leftActiveFixedColKey === column.key,
                              'n-data-table-td--shadow-before':
                                rightActiveFixedColKey === column.key,
                              'n-data-table-td--selection':
                                column.type === 'selection'
                            }
                          ]}
                        >
                          {column.type === 'selection' ? (
                            <NCheckbox
                              key={currentPage}
                              disabled={column.disabled?.(row)}
                              checked={mergedCheckedRowKeys.includes(
                                tmNode.key
                              )}
                              onUpdateChecked={(checked) =>
                                handleCheckboxUpdateChecked(tmNode, checked)
                              }
                            />
                          ) : (
                            <Cell index={index} row={row} column={column} />
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }}
      </NScrollbar>
    )
  }
})